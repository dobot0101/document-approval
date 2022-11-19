/**
 * 결재결과
 * APPROVED: 승인
 * REJECTED: 반려
 */
export enum ApprovalLineStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/**
 * VACATION: 휴가신청서
 * DISBURSEMENT: 지출결의서
 */
export enum ApprovalRequestType {
  VACATION = 'VACATION',
  DISBURSEMENT = 'DISBURSEMENT',
}

/**
 * REVIEW: 검토
 * APPROVAL: 승인
 */
export enum ApprovalStepType {
  REVIEW = 'REVIEW',
  APPROVAL = 'APPROVAL',
}
