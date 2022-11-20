import { Service } from 'typedi'
import { LessThan } from 'typeorm'
import { AppDataSource } from '../data-source'
import { ApprovalLine } from '../typeorm/entity/ApprovalLine'

@Service()
export class ApprovalLineRepository {
  async findPreviousLinesByOrderAndRequestId(order: number, requestId: string) {
    console.log({requestId})
    return AppDataSource.getRepository(ApprovalLine).findBy({
      order: LessThan(order),
      approvalRequest: {
        id: requestId,
      },
    })
  }

  async save(approvalLine: ApprovalLine) {
    return await AppDataSource.getRepository(ApprovalLine).save(approvalLine)
  }
  async getByIdAndUserId(id: string, userId: string) {
    const approvalLine = await AppDataSource.getRepository(ApprovalLine).findOneBy({
      id: id,
      approver: { id: userId },
    })
    return approvalLine
  }
}
