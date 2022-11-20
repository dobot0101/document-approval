import { randomUUID } from 'crypto'
import { Service } from 'typedi'
import { AppDataSource } from '../data-source'
import { ApprovalLineRepository } from '../repositories/ApprovalLine'
import { ApprovalRequestRepository } from '../repositories/ApprovalRequest'
import { ApprovalLine } from '../typeorm/entity/ApprovalLine'
import { ApprovalRequest } from '../typeorm/entity/ApprovalRequest'
import { ApprovalLineStatus, ApprovalRequestType } from '../typeorm/enums'

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
  approvalLines: {
    approverId: string
    order: number
  }[]
}

@Service()
export class ApprovalRequestService {
  constructor(
    private approvalRequestRepository: ApprovalRequestRepository,
    private approvalLineRepository: ApprovalLineRepository,
  ) {}

  request(userId: string, input: ApprovalRequestInput) {
    const { title, content, type, approvalLines } = input
    const approvalRequest = AppDataSource.getRepository(ApprovalRequest).create({
      id: randomUUID(),
      title,
      type,
      content,
      approvalLines: approvalLines.map(approvalLine =>
        AppDataSource.getRepository(ApprovalLine).create({
          id: randomUUID(),
          order: approvalLine.order,
          approver: {
            id: approvalLine.approverId,
          },
          comment: null,
        }),
      ),
      requester: {
        id: userId,
      },
    })

    return this.approvalRequestRepository.save(approvalRequest)
  }

  async reject(input: RejectInput) {
    const { approvalLineId, userId, comment } = input
    const approvalLine = await this.approvalLineRepository.getByIdAndUserId(approvalLineId, userId)
    if (!approvalLine) {
      throw new Error('결재선이 없습니다.')
    }

    if (approvalLine.status !== null) {
      throw new Error('이미 처리된 결재선입니다.')
    }

    // 내 차례인지 확인
    const { approvalRequest, order } = approvalLine
    const lines = await this.approvalLineRepository.findPreviousLinesByOrderAndRequestId(
      order,
      approvalRequest.id,
    )

    if (lines.some(line => line.status !== 'APPROVED')) {
      throw new Error('아직 결재할 차례가 아닙니다.')
    }

    approvalLine.comment = comment ?? null
    approvalLine.status = ApprovalLineStatus.REJECTED
    return this.approvalLineRepository.save(approvalLine)
  }

  async approve(input: ApproveInput) {
    const { approvalLineId, userId, comment } = input
    const approvalLine = await this.approvalLineRepository.getByIdAndUserId(approvalLineId, userId)
    if (!approvalLine) {
      throw new Error('결재선이 없습니다.')
    }

    if (approvalLine.status !== null) {
      throw new Error('이미 처리된 결재선입니다.')
    }

    // 내 차례인지 확인
    const { approvalRequest, order } = approvalLine
    const lines = await this.approvalLineRepository.findPreviousLinesByOrderAndRequestId(
      order,
      approvalRequest.id,
    )

    if (lines.some(line => line.status !== 'APPROVED')) {
      throw new Error('아직 결재할 차례가 아닙니다.')
    }

    approvalLine.comment = comment ?? null
    approvalLine.status = ApprovalLineStatus.APPROVED
    return this.approvalLineRepository.save(approvalLine)
  }

  findArchive(userId: string) {
    return this.approvalRequestRepository.findArchive(userId)
  }

  findInbox(userId: string) {
    return this.approvalRequestRepository.findInbox(userId)
  }

  findOutbox(userId: string) {
    return this.approvalRequestRepository.findOutbox(userId)
  }
}
