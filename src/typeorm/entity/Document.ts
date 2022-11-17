import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import { DocumentStatus, DocumentType } from '../enums'
import { ApprovalLine } from './ApprovalLine'
import { User } from './User'

@Entity()
export class Document {
  @PrimaryColumn('uuid')
  id!: string

  @Column('text')
  title!: string

  @Column('enum', { enum: DocumentType })
  type!: DocumentType

  @Column('text')
  body!: string

  @Column('datetime')
  createdAt!: Date

  @Column('enum', {
    enum: DocumentStatus,
  })
  status!: DocumentStatus

  @ManyToOne(() => User, user => user.document)
  requester!: User

  @OneToMany(() => ApprovalLine, approvalLine => approvalLine.document)
  approvalLines!: ApprovalLine[]
}
