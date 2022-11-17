/**
 * 결재결과
 * APPROVED: 승인
 * REJECTED: 반려
 */
export enum ApprovalResult {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/**
 * OUTBOX: 내가 생성한 문서 중 결재 진행 중인 문서
 * INBOX: 내가 결재를 해야 할 문서
 * ARCHIVE: 내가 관여한 문서 중 결재가 완료(승인 또는 거절)된 문서
 */
export enum DocumentStatus {
  OUTBOX = 'OUTBOX',
  INBOX = 'INBOX',
  ARCHIVE = 'ARCHIVE',
}

/**
 * VACATION: 휴가신청서
 * DISBURSEMENT: 지출결의서
 */
export enum DocumentType {
  VACATION = 'VACATION',
  DISBURSEMENT = 'DISBURSEMENT',
}
