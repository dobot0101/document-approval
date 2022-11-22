import { Service } from 'typedi'
import { AppDataSource } from '../common/data-source'
import { ApprovalLine } from '../entities/ApprovalLine.entity'

@Service()
export class ApprovalLineRepository {
  async save(approvalLine: ApprovalLine) {
    return AppDataSource.getRepository(ApprovalLine).save(approvalLine)
  }
  async getById(id: string) {
    const approvalLine = await AppDataSource.getRepository(ApprovalLine).findOneBy({
      id: id,
    })
    return approvalLine
  }
}
