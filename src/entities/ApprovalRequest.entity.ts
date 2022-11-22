import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import { ApprovalRequestStatus, ApprovalRequestType } from '../common/enums'
import { ApprovalLine } from './ApprovalLine.entity'
import { User } from './User.entity'

@Entity()
export class ApprovalRequest {
  @PrimaryColumn('uuid')
  id!: string

  @Column('text')
  title!: string

  @Column('text')
  content!: string

  @Column('enum', { enum: ApprovalRequestType })
  type!: ApprovalRequestType

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @ManyToOne(() => User, user => user.requests)
  requester!: User

  @Column('uuid')
  requesterId!: string

  @OneToMany(() => ApprovalLine, approvalLine => approvalLine.approvalRequest, {
    cascade: true,
    eager: true,
  })
  approvalLines!: ApprovalLine[]

  @Column('uuid', { nullable: true })
  nextApprovalLineId!: string | null

  @Column('enum', { enum: ApprovalRequestStatus, default: ApprovalRequestStatus.REQUESTED })
  status!: ApprovalRequestStatus
}
