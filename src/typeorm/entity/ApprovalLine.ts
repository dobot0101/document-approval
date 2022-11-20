import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { ApprovalLineStatus } from '../enums'
import { ApprovalRequest } from './ApprovalRequest'
import { User } from './User'

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

  @ManyToOne(() => User, user => user.approvalLines)
  approver!: User

  @ManyToOne(() => ApprovalRequest, approvalRequest => approvalRequest.approvalLines, {
    eager: true,
  })
  approvalRequest!: ApprovalRequest
}
