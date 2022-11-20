import { Service } from 'typedi'
import { AppDataSource } from '../data-source'
import { ApprovalLine } from '../typeorm/entity/ApprovalLine'
import { ApprovalRequest } from '../typeorm/entity/ApprovalRequest'

@Service()
export class ApprovalRequestRepository {
  async save(approvalRequest: ApprovalRequest) {
    return AppDataSource.getRepository(ApprovalRequest).save(approvalRequest)
  }

  /**
   * 내가 관여한(생성 또는 결재라인에 포함된) 문서 중 결재가 완료(승인 또는 거절)된 문서 조회
   */
  async findArchive(userId: string) {
    const requests = await AppDataSource.getRepository(ApprovalRequest)
      .createQueryBuilder('ar')
      .leftJoin(
        sqb =>
          sqb
            .select(`al.approval_request_id, count(*) as rejected_count`)
            .from(ApprovalLine, 'al')
            .where(`al.status = 'REJECTED'`)
            .groupBy(`al.approval_request_id`),
        'rej_al',
        `rej_al.approval_request_id = ar.id`,
      )
      .leftJoin(
        sqb =>
          sqb
            .select(`al.approval_request_id, count(*) as not_approved_count`)
            .from(ApprovalLine, 'al')
            .where(`al.status <> 'APPROVED'`)
            .groupBy(`al.approval_request_id`),
        'not_app_al',
        `not_app_al.approval_request_id = ar.id`,
      )
      .where(
        `(rej_al.rejected_count > 0 or not_app_al.not_approved_count = 0) and 
        (
          ar.requester_id = :requesterId or ar.id in (select approval_request_id from approval_line al where approver_id = :approverId)
        )`,
        { requesterId: userId, approverId: userId },
      )
      .getMany()
    return requests
  }

  /**
   * 내가 생성한 문서 중 결재 진행 중인 문서
   */
  async findOutbox(userId: string) {
    const requests = await AppDataSource.getRepository(ApprovalRequest)
      .createQueryBuilder('ar')
      .leftJoin(
        sqb =>
          sqb
            .select(`al.approval_request_id, count(*) as count`)
            .from(ApprovalLine, 'al')
            .where(`al.status = 'REJECTED'`)
            .groupBy(`al.approval_request_id`),
        'rej_al',
        `rej_al.approval_request_id = ar.id`,
      )
      .leftJoin(
        sqb =>
          sqb
            .select(`al.approval_request_id, count(*) as count`)
            .from(ApprovalLine, 'al')
            .where(`al.status is null`)
            .groupBy(`al.approval_request_id`),
        'not_app_al',
        `not_app_al.approval_request_id = ar.id`,
      )
      .where(`rej_al.count is null and not_app_al.count > 0 and ar.requester_id = :requesterId`, {
        requesterId: userId,
      })
      .getMany()
    return requests
  }

  /**
   * 내가 결제를 해야 할 문서
   */
  async findInbox(userId: string) {
    const requests = await AppDataSource.getRepository(ApprovalRequest)
      .createQueryBuilder('ar')
      .innerJoin(
        ApprovalLine,
        'al',
        `al.approval_request_id = ar.id and al.status is null and al.approver_id = :approverId`,
        {
          approverId: userId,
        },
      )
      .leftJoin(
        sqb =>
          sqb
            .select(`al.approval_request_id, count(*) as count`)
            .from(ApprovalLine, 'al')
            .where(`al.status = 'REJECTED'`)
            .groupBy(`al.approval_request_id`),
        'rej_al',
        `rej_al.approval_request_id = ar.id`,
      )
      .leftJoin(
        sqb =>
          sqb
            .select(`al.approval_request_id, count(*) as count`)
            .from(ApprovalLine, 'al')
            .where(`al.status is null`)
            .groupBy(`al.approval_request_id`),
        'no_act_al',
        `no_act_al.approval_request_id = ar.id`,
      )
      .where(`rej_al.count is null and no_act_al.count > 0`)
      .getMany()
    return requests
  }
}
