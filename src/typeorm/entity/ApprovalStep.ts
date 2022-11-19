import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import { ApprovalStepType } from '../enums'
import { ApprovalLine } from './ApprovalLine'
import { ApprovalRequest } from './ApprovalRequest'

@Entity()
export class ApprovalStep {
  @PrimaryColumn('uuid')
  id!: string

  @Column('enum', {
    enum: ApprovalStepType,
  })
  type!: ApprovalStepType

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: string

  @OneToMany(() => ApprovalLine, line => line.step, { cascade: true })
  lines!: ApprovalLine[]

  @ManyToOne(() => ApprovalRequest, request => request.steps)
  request!: ApprovalRequest
}
