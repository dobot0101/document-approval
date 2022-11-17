import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { ApprovalResult } from '../enums'
import { Document } from './Document'
import { User } from './User'

@Entity()
export class ApprovalLine {
  @PrimaryColumn('uuid')
  id!: string

  @Column('text', { nullable: true }) comment?: string | null
  @Column('enum', {
    enum: ApprovalResult,
  })
  result!: ApprovalResult
  @Column('int') order!: number

  @Column('datetime')
  createdAt!: Date

  @ManyToOne(() => Document, document => document.approvalLines)
  document!: Document

  @ManyToOne(() => User, user => user.approvalLines)
  approver!: User
}
