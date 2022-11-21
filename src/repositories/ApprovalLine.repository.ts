import { Service } from 'typedi'
import { AppDataSource } from '../common/data-source'
import { ApprovalLine } from '../entities/ApprovalLine'

@Service()
export class ApprovalLineRepository {
  async save(approvalLine: ApprovalLine) {
    return AppDataSource.getRepository(ApprovalLine).save(approvalLine)
  }
  async getByIdAndUserId(id: string, userId: string) {
    const approvalLine = await AppDataSource.getRepository(ApprovalLine).findOneBy({
      id: id,
      approver: { id: userId },
    })
    return approvalLine
  }
}
