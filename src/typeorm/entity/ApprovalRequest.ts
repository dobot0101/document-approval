import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from 'typeorm'
import { ApprovalRequestType } from '../enums'
import { ApprovalStep } from './ApprovalStep'
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

  @OneToMany(() => ApprovalStep, step => step.request, { cascade: true })
  steps!: ApprovalStep[]

  @OneToOne(() => ApprovalStep)
  @JoinColumn()
  currentStep!: ApprovalStep

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @ManyToOne(() => User, user => user.requests)
  requester!: User
}
