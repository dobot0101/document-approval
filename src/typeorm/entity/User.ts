import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { ApprovalLine } from './ApprovalLine'
import { ApprovalRequest } from './ApprovalRequest'

@Entity()
export class User {
  @PrimaryColumn('uuid')
  id!: string

  @Column('text')
  name!: string

  @Column('text')
  email!: string

  @Column('text')
  password!: string

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @OneToMany(() => ApprovalRequest, request => request.requester, { nullable: true })
  requests!: ApprovalRequest[] | null

  @OneToMany(() => ApprovalLine, approvalLine => approvalLine.approver, { nullable: true })
  approvalLines!: ApprovalLine[] | null
}
