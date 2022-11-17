import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { ApprovalLine } from './ApprovalLine'
import { Document } from './Document'

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

  @Column('datetime')
  createdAt!: Date

  @OneToMany(() => Document, document => document.requester)
  document!: Document

  @OneToMany(() => ApprovalLine, approvalLine => approvalLine.approver)
  approvalLines!: ApprovalLine[]
}
