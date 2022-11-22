import Container from 'typedi'
import { AppDataSource, createDataSource } from '../../common/data-source'
import { ApprovalLineStatus, ApprovalRequestStatus, ApprovalRequestType } from '../../common/enums'
import { ApprovalRequest } from '../../entities/ApprovalRequest.entity'
import { User } from '../../entities/User.entity'
import { ApprovalLineRepository } from '../../repositories/ApprovalLine.repository'
import { ApprovalRequestRepository } from '../../repositories/ApprovalRequest.repository'
import { ApprovalRequestService } from '../ApprovalRequest.service'
import { AuthService } from '../Auth.service'

const approvalRequestService = Container.get(ApprovalRequestService)
const approvalLineRepository = Container.get(ApprovalLineRepository)
const approvalRequestRepository = Container.get(ApprovalRequestRepository)
const authService = Container.get(AuthService)

const approvalLineInputs: { approverId: string; order: number }[] = []
const emails: string[] = ['tester1@test.com', 'tester2@test.com', 'tester3@test.com']
let users: User[]

beforeAll(async () => {
  createDataSource(true)
  await AppDataSource.initialize()

  users = await addUsersByEmail(emails)
  users.forEach((user, idx) =>
    approvalLineInputs.push({
      approverId: user.id,
      order: idx + 1,
    }),
  )
})

describe('걀제 요청 및 요청에 대한 처리(승인/거절) 테스트', () => {
  it('결재를 요청한다.', async () => {
    const approvalRequest = await approvalRequestService.request(users[0].id, {
      approvalLineInputs,
      content: 'test content',
      title: 'test title',
      type: ApprovalRequestType.DISBURSEMENT,
    })
    expect(approvalRequest instanceof ApprovalRequest).toBeTruthy()
  })

  it(`결재할 차례가 아닌 사람이 결재를 시도하면 Error('결재할 차례가 아닙니다.')가 발생한다.`, async () => {
    const approvalRequest = await approvalRequestService.request(users[0].id, {
      approvalLineInputs,
      content: 'test content',
      title: 'test title',
      type: ApprovalRequestType.DISBURSEMENT,
    })

    const approvalLineToThrowError = approvalRequest.approvalLines.find(
      approvalLine => approvalLine.id !== approvalRequest.nextApprovalLineId,
    )

    if (!approvalLineToThrowError) {
      throw new Error('에러 테스트용 결재라인이 없습니다.')
    }

    try {
      await approvalRequestService.approve({
        approvalLineId: approvalLineToThrowError.id,
        userId: approvalLineToThrowError.approverId,
        comment: 'approve test comment',
      })
    } catch (error: any) {
      expect(error.message).toBe('결재할 차례가 아닙니다.')
    }
  })

  it('결재 요청을 승인한다.', async () => {
    const approvalRequest = await approvalRequestService.request(users[0].id, {
      approvalLineInputs,
      content: 'test content',
      title: 'test title',
      type: ApprovalRequestType.DISBURSEMENT,
    })

    const approvalLine = await approvalLineRepository.getById(approvalRequest.nextApprovalLineId!)
    const approvedApprovalLine = await approvalRequestService.approve({
      approvalLineId: approvalLine!.id,
      userId: approvalLine!.approverId,
      comment: 'approve test comment',
    })

    expect(approvedApprovalLine.status === ApprovalLineStatus.APPROVED).toEqual(true)
  })

  it('결재 요청을 거절한다.', async () => {
    const approvalRequest = await approvalRequestService.request(users[0].id, {
      approvalLineInputs,
      content: 'test content',
      title: 'test title',
      type: ApprovalRequestType.DISBURSEMENT,
    })

    const approvalLine = await approvalLineRepository.getById(approvalRequest.nextApprovalLineId!)

    const rejectedLine = await approvalRequestService.reject({
      approvalLineId: approvalLine!.id,
      userId: approvalLine!.approverId,
      comment: 'reject test comment',
    })

    const rejectedApprovalRequest = await approvalRequestRepository.getById(
      rejectedLine.approvalRequestId,
    )

    expect(rejectedLine.status === ApprovalLineStatus.REJECTED).toEqual(true)
    expect(rejectedApprovalRequest!.status === ApprovalRequestStatus.REJECTED).toEqual(true)
  })

  it(`INBOX 목록을 조회한다.`, async () => {
    const inbox = await approvalRequestService.findInbox(users[0].id)
    console.log(inbox)
    expect(inbox).toBeTruthy()
  })
  it(`OUTBOX 목록을 조회한다.`, async () => {
    const outbox = await approvalRequestService.findOutbox(users[0].id)
    console.log(outbox)
    expect(outbox).toBeTruthy()
  })
  it(`ARCHIVE 목록을 조회하고, 조회된 결재요청 각각의 상태는 APPROVED 또는 REJECTED 이어야 한다.`, async () => {
    const approvalRequests = await approvalRequestService.findArchive(users[0].id)

    const archiveStatuses = [ApprovalRequestStatus.APPROVED, ApprovalRequestStatus.REJECTED]
    expect(
      approvalRequests.every(approvalRequest => archiveStatuses.includes(approvalRequest.status)),
    ).toBeTruthy()
  })
})

afterAll(async () => {
  await AppDataSource.dropDatabase()
  await AppDataSource.destroy()
})

async function addUsersByEmail(emails: string[]) {
  const users = await Promise.all(
    emails.map(email =>
      authService.signup({
        email,
        name: 'tester',
        password: 'test',
      }),
    ),
  )
  return users
}
