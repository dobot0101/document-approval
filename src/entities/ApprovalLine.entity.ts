import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { ApprovalLineStatus } from '../common/enums'
import { ApprovalRequest } from './ApprovalRequest.entity'
import { User } from './User.entity'

@Entity()
export class ApprovalLine {
  @PrimaryColumn('uuid')
  id!: string

  @Column('text', { nullable: true })
  comment!: string | null

  @Column('int')
  order!: number

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @Column('enum', {
    enum: ApprovalLineStatus,
    nullable: true,
    default: null,
  })
  status!: ApprovalLineStatus

  @ManyToOne(() => User, user => user.approvalLines, { cascade: true })
  approver!: User

  @Column('uuid')
  approverId!: string

  @ManyToOne(() => ApprovalRequest, approvalRequest => approvalRequest.approvalLines)
  approvalRequest!: ApprovalRequest

  @Column('uuid')
  approvalRequestId!: string
}
