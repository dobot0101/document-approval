import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import { ApprovalRequestType } from '../enums'
import { ApprovalLine } from './ApprovalLine'
import { User } from './User'

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

  @OneToMany(() => ApprovalLine, approvalLine => approvalLine.approvalRequest, { cascade: true })
  approvalLines!: ApprovalLine[]
}
