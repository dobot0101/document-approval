import { Service } from 'typedi'
import { AppDataSource } from '../common/data-source'
import { ApprovalLine } from '../entities/ApprovalLine.entity'
import { ApprovalRequest } from '../entities/ApprovalRequest.entity'
import { ApprovalRequestStatus } from '../common/enums'

@Service()
export class ApprovalRequestRepository {
  async getById(id: string) {
    return AppDataSource.getRepository(ApprovalRequest).findOneBy({
      id,
    })
  }

  async save(approvalRequest: ApprovalRequest) {
    return AppDataSource.getRepository(ApprovalRequest).save(approvalRequest)
  }

  async findArchive(userId: string) {
    const requests = await AppDataSource.getRepository(ApprovalRequest)
      .createQueryBuilder('ar')
      .where(
        `ar.status in ('APPROVED', 'REJECTED') 
        and (ar.requester_id = :requesterId or ar.id in (select id from approval_line where approver_id = :approverId))`,
        {
          requesterId: userId,
          approverId: userId,
        },
      )
      .getMany()
    return requests
  }

  async findOutbox(userId: string) {
    return AppDataSource.getRepository(ApprovalRequest)
      .createQueryBuilder('ar')
      .where(`ar.requester_id = :requesterId and status = :status`, {
        requesterId: userId,
        status: ApprovalRequestStatus.REQUESTED,
      })
      .getMany()
  }

  async findInbox(userId: string) {
    const requests = await AppDataSource.getRepository(ApprovalRequest)
      .createQueryBuilder('ar')
      .innerJoin(
        ApprovalLine,
        'al',
        `al.approval_request_id = ar.id and al.status is null 
        and al.approver_id = :approverId and ar.next_approval_line_id = al.id`,
        {
          approverId: userId,
        },
      )
      .where(`ar.status = 'REQUESTED'`)
      .getMany()

    return requests
  }
}
