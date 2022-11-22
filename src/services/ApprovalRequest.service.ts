import { randomUUID } from 'crypto'
import { Service } from 'typedi'
import { AppDataSource } from '../common/data-source'
import { ApprovalLineStatus, ApprovalRequestStatus, ApprovalRequestType } from '../common/enums'
import { ApprovalLine } from '../entities/ApprovalLine.entity'
import { ApprovalRequest } from '../entities/ApprovalRequest.entity'
import { ApprovalLineRepository } from '../repositories/ApprovalLine.repository'
import { ApprovalRequestRepository } from '../repositories/ApprovalRequest.repository'

@Service()
export class ApprovalRequestService {
  constructor(
    private approvalRequestRepository: ApprovalRequestRepository,
    private approvalLineRepository: ApprovalLineRepository,
  ) {}

  /**
   * 결재 요청
   */
  async request(userId: string, input: ApprovalRequestInput) {
    const { title, content, type, approvalLineInputs } = input

    const approvalLines = approvalLineInputs.map(({ order, approverId }) =>
      AppDataSource.getRepository(ApprovalLine).create({
        id: randomUUID(),
        order: order,
        approverId: approverId,
        comment: null,
      }),
    )

    approvalLines.sort((a, b) => a.order - b.order)

    const approvalRequestId = randomUUID()
    const approvalRequest = AppDataSource.getRepository(ApprovalRequest).create({
      id: approvalRequestId,
      title,
      type,
      content,
      approvalLines: approvalLines,
      requesterId: userId,
      nextApprovalLineId: approvalLines[0].id,
    })

    return this.approvalRequestRepository.save(approvalRequest)
  }

  /**
   * 결재 거절
   */
  async reject(input: RejectInput) {
    const { approvalLineId, userId, comment } = input
    const approvalLine = await this.approvalLineRepository.getById(approvalLineId)
    if (!approvalLine) {
      throw new Error('결재선이 없습니다.')
    }

    this.validateApprovalLine(approvalLine, userId)

    // 내 차례인지 확인
    const { approvalRequestId } = approvalLine
    await this.checkOrder(approvalRequestId, approvalLineId)

    const updatedApprovalLine = await this.updateApprovalLine(
      approvalLine,
      ApprovalLineStatus.REJECTED,
      comment,
    )

    const approvalRequest = await this.approvalRequestRepository.getById(
      updatedApprovalLine.approvalRequestId,
    )
    if (!approvalRequest) {
      throw new Error('결재 요청이 없습니다.')
    }

    // 결재라인의 상태가 하나라도 REJECTED이면 ApprovalRequest의 상태를 REJECTED로, 다음 결재라인을 null로 업데이트한다.
    if (
      approvalRequest.approvalLines.some(
        approvalLine => approvalLine.status === ApprovalLineStatus.REJECTED,
      )
    ) {
      approvalRequest.status = ApprovalRequestStatus.REJECTED
      approvalRequest.nextApprovalLineId = null
      await this.approvalRequestRepository.save(approvalRequest)
    }

    return updatedApprovalLine
  }

  /**
   * 결재 승인
   */

  async approve(input: ApproveInput) {
    const { approvalLineId, userId, comment } = input
    const approvalLine = await this.approvalLineRepository.getById(approvalLineId)

    if (!approvalLine) {
      throw new Error('결재선이 없습니다.')
    }

    this.validateApprovalLine(approvalLine, userId)

    // 내 차례인지 확인
    const { approvalRequestId } = approvalLine
    await this.checkOrder(approvalRequestId, approvalLineId)

    // ApprovalLine의 상태, 코멘트 저장
    const updatedApprovalLine = await this.updateApprovalLine(
      approvalLine,
      ApprovalLineStatus.APPROVED,
      comment,
    )

    const approvalRequest = await this.approvalRequestRepository.getById(
      updatedApprovalLine.approvalRequestId,
    )

    if (!approvalRequest) {
      throw new Error('결재 요청이 없습니다.')
    }

    // 모든 결재선의 상태가 APPROVED이면 ApprovalRequest의 상태를 APPROVED로, 다음 결재라인을 null로 업데이트한다.
    if (approvalRequest.approvalLines.every(approvalLine => approvalLine.status === 'APPROVED')) {
      approvalRequest.status = ApprovalRequestStatus.APPROVED
      approvalRequest.nextApprovalLineId = null
    } else {
      // 모든 ApprovalLine이 APPROVED가 아니면 다음 결재라인을 업데이트한다.
      const { approvalLines: approvalLinesToFindNext } = approvalRequest
      approvalLinesToFindNext.sort((a, b) => a.order - b.order)

      const nextApprovalLine = approvalLinesToFindNext.find(
        approvalLineToFindNext => approvalLineToFindNext.order > approvalLine.order,
      )

      approvalRequest.nextApprovalLineId = nextApprovalLine ? nextApprovalLine.id : null
    }
    await this.approvalRequestRepository.save(approvalRequest)

    return updatedApprovalLine
  }

  /**
   * 내가 관여한(생성 또는 결재라인에 포함된) 문서 중 결재가 완료(승인 또는 거절)된 문서 조회
   */
  findArchive(userId: string) {
    return this.approvalRequestRepository.findArchive(userId)
  }

  /**
   * 내가 생성한 문서 중 결재 진행 중인 문서
   */
  findInbox(userId: string) {
    return this.approvalRequestRepository.findInbox(userId)
  }

  /**
   * 내가 결제를 해야 할 문서
   */
  findOutbox(userId: string) {
    return this.approvalRequestRepository.findOutbox(userId)
  }

  /**
   * 지금이 내가 결재할 차례인지 확인
   */
  private async checkOrder(approvalRequestId: string, approvalLineId: string) {
    const approvalRequest = await this.approvalRequestRepository.getById(approvalRequestId)
    if (!approvalRequest) {
      throw new Error('결재요청이 없습니다.')
    }

    if (approvalRequest.nextApprovalLineId !== approvalLineId) {
      throw new Error('결재할 차례가 아닙니다.')
    }
  }

  /**
   * ApprovalLine의 status, comment 저장
   */
  private async updateApprovalLine(
    approvalLine: ApprovalLine,
    status: ApprovalLineStatus,
    comment?: string | null,
  ) {
    approvalLine.comment = comment ?? null
    approvalLine.status = status
    return this.approvalLineRepository.save(approvalLine)
  }

  /**
   * ApprovalLine이 결재 가능한 상태인지, 결재자가 나인지 확인
   */
  private validateApprovalLine(approvalLine: ApprovalLine, userId: string) {
    if (approvalLine.status !== null) {
      throw new Error('이미 처리된 결재선입니다.')
    }

    if (approvalLine.approverId !== userId) {
      throw new Error('결재자가 아닙니다.')
    }
  }
}

export type ApproveInput = {
  approvalLineId: string
  userId: string
  comment?: string | null
}
export type RejectInput = {
  approvalLineId: string
  userId: string
  comment?: string | null
}
export type ApprovalRequestInput = {
  title: string
  content: string
  type: ApprovalRequestType
  approvalLineInputs: {
    approverId: string
    order: number
  }[]
}
