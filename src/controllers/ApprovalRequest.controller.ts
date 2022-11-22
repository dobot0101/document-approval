import express, { NextFunction, Request, Response } from 'express'
import { body, param } from 'express-validator'
import Container from 'typedi'
import { checkValidationError } from '../common/functions'
import { authenticateToken } from '../middlewares/auth.middleware'
import { ApprovalRequestInput, ApprovalRequestService } from '../services/ApprovalRequest.service'
import { ApprovalRequestType } from '../common/enums'

const router = express.Router()
const approvalRequestService = Container.get(ApprovalRequestService)

/**
 * 승인
 */
router.post(
  '/approve/:approvalLineId',
  authenticateToken,
  [param('approvalLineId').trim().notEmpty().isString()],
  checkValidationError,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const approvedApprovalLine = await approvalRequestService.approve({
        approvalLineId: req.params.approvalLineId,
        userId: req.userId!,
        comment: req.body.comment,
      })
      res.status(200).json(approvedApprovalLine)
    } catch (error) {
      next(error)
    }
  },
)

/**
 * 반려
 */
router.post(
  '/reject/:approvalLineId',
  authenticateToken,
  [param('approvalLineId').trim().notEmpty().isString()],
  checkValidationError,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rejectedApprovalLine = await approvalRequestService.reject({
        approvalLineId: req.params.approvalLineId,
        userId: req.userId!,
        comment: req.body.comment,
      })
      res.status(200).json(rejectedApprovalLine)
    } catch (error) {
      next(error)
    }
  },
)

/**
 * 결재 요청
 */
router.post(
  '/request',
  authenticateToken,
  [
    body('title').trim().notEmpty().isString(),
    body('content').trim().notEmpty().isString(),
    body('type').isIn(
      Object.keys(ApprovalRequestType).map(
        key => ApprovalRequestType[key as keyof typeof ApprovalRequestType],
      ),
    ),
    body('approvalLineInputs').isArray(),
    body('approvalLineInputs.*.approverId').trim().isString().notEmpty(),
    body('approvalLineInputs.*.order').trim().isInt().notEmpty(),
  ],
  checkValidationError,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: ApprovalRequestInput = req.body
      const request = await approvalRequestService.request(req.userId!, input)
      res.status(200).json(request)
    } catch (error) {
      next(error)
    }
  },
)

/**
 * INBOX: 내가 결재를 해야 할 문서
 */
router.get('/list/inbox', authenticateToken, async (req, res, next) => {
  try {
    const requests = await approvalRequestService.findInbox(req.userId!)
    res.status(200).json(requests)
  } catch (error) {
    next(error)
  }
})

/**
 * OUTBOX: 내가 생성한 문서 중 결재 진행 중인 문서
 */
router.get('/list/outbox', authenticateToken, async (req, res, next) => {
  try {
    const requests = await approvalRequestService.findOutbox(req.userId!)
    res.status(200).json(requests)
  } catch (error) {
    next(error)
  }
})

/**
 * ARCHIVE: 내가 관여한 문서 중 결재가 완료(승인 또는 거절)된 문서
 */
router.get('/list/archive', authenticateToken, async (req, res, next) => {
  try {
    const requests = await approvalRequestService.findArchive(req.userId!)
    res.status(200).json(requests)
  } catch (error) {
    next(error)
  }
})

export default router
