import 'reflect-metadata'
import { randomUUID } from 'crypto'
import express, { Express, NextFunction, Request, Response } from 'express'
import { configs } from './configs'
import { AppDataSource } from './data-source'
import { initTestData, users } from './init-data'
import { JwtService } from './services/jwt.service'
import { ApprovalLine } from './typeorm/entity/ApprovalLine'
import { ApprovalRequest } from './typeorm/entity/ApprovalRequest'
import { ApprovalStep } from './typeorm/entity/ApprovalStep'
import { ApprovalLineStatus } from './typeorm/enums'
import bcrypt from 'bcrypt'
import { User } from './typeorm/entity/User'
import { JwtPayload } from 'jsonwebtoken'

AppDataSource.initialize()
  .then(async () => {
    await initTestData()
    initServer()
  })
  .catch(error => console.log(error))

/**
 * express 초기화
 */
function initServer() {
  const app: Express = express()
  const port = configs.PORT
  app.use(express.json())

  const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const jwt = JwtService.getJwtFromRequest(req)
    if (jwt) {
      req.userId = (jwt as JwtPayload).id
    }
    next()
  }

  /**
   * 회원가입
   */
  app.post('/signup', async (req, res, next) => {
    try {
      console.log(req.body)
      const { email, password, name } = req.body
      const userRepo = AppDataSource.getRepository(User)
      const user = await userRepo.findOneBy({
        email,
      })

      if (user) {
        throw new Error('이미 사용 중인 이메일입니다.')
      }

      const encryptedPassword = await bcrypt.hash(password, 10)
      const savedUser = await userRepo.save({
        id: randomUUID(),
        email,
        name,
        password: encryptedPassword,
        approvalLines: null,
        requests: null,
      })
      res.status(200).json(savedUser)
    } catch (error) {
      next(error)
    }
  })

  /**
   * 로그인
   */

  app.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body
      const user = await AppDataSource.getRepository(User).findOneBy({ email })
      if (!user) {
        throw new Error('회원이 없습니다.')
      }

      const same = await bcrypt.compare(password, user.password)
      if (same) {
        const token = JwtService.createJWT(user.id)
        res.status(200).json({
          message: 'token is created',
          token,
        })
      } else {
        throw new Error('비밀번호가 일치하지 않습니다.')
      }
    } catch (error) {
      next(error)
    }
  })

  /**
   * INBOX: 내가 결재를 해야 할 문서
   */
  app.get('/approval-request/list/inbox', authenticateToken, async (req, res) => {
    const requests = await AppDataSource.getRepository(ApprovalRequest)
      .createQueryBuilder('ar')
      .innerJoin(ApprovalStep, 'as', `as.request_id = ar.id`)
      .innerJoin(ApprovalLine, 'al', `al.step_id = as.id and al.status is null and al.approver_id = :approverId`, {
        approverId: req.userId,
      })
      .leftJoin(
        sqb =>
          sqb
            .select(`al.step_id, count(*) as count`)
            .from(ApprovalLine, 'al')
            .where(`al.status = 'REJECTED'`)
            .groupBy(`al.step_id`),
        'rej_al',
        `rej_al.step_id = as.id`,
      )
      .leftJoin(
        sqb =>
          sqb
            .select(`al.step_id, count(*) as count`)
            .from(ApprovalLine, 'al')
            .where(`al.status is null`)
            .groupBy(`al.step_id`),
        'no_act_al',
        `no_act_al.step_id = as.id`,
      )
      .where(`rej_al.count = 0 and no_act_al.count > 0`)
      // .getQuery()
      .getMany()

    console.log(requests)

    res.json(requests)
  })

  /**
   * OUTBOX: 내가 생성한 문서 중 결재 진행 중인 문서
   */
  app.get('/approval-request/list/outbox', async (req, res) => {
    if (!req.userId) {
      throw new Error(`사용자 아이디가 없습니다.`)
    }
    const requests = await AppDataSource.getRepository(ApprovalRequest)
      .createQueryBuilder('ar')
      .innerJoin(ApprovalStep, 'as', `as.request_id = ar.id`)
      .leftJoinAndSelect(
        sqb =>
          sqb
            .select(`al.step_id, count(*) as count`)
            .from(ApprovalLine, 'al')
            .where(`al.status = 'REJECTED'`)
            .groupBy(`al.step_id`),
        'rej_al',
        `rej_al.step_id = as.id`,
      )
      .leftJoinAndSelect(
        sqb =>
          sqb
            .select(`al.step_id, count(*) as count`)
            .from(ApprovalLine, 'al')
            .where(`al.status is null`)
            .groupBy(`al.step_id`),
        'no_act_al',
        `no_act_al.step_id = as.id`,
      )
      .where(`rej_al.count = 0 and no_act_al.count > 0 and ar.requester_id = :requesterId`, { requesterId: req.userId })
      .getMany()

    console.log(requests)

    res.json(requests)
  })

  /**
   * ARCHIVE: 내가 관여한 문서 중 결재가 완료(승인 또는 거절)된 문서
   */
  app.get('/approval-request/list/archive', async (req, res) => {
    if (!req.userId) {
      throw new Error(`사용자 아이디가 없습니다.`)
    }
    const requests = await AppDataSource.getRepository(ApprovalRequest)
      .createQueryBuilder('ar')
      .innerJoin(ApprovalStep, 'as', `as.request_id = ar.id`)
      .innerJoin(ApprovalLine, 'al', `al.step_id = as.id and al.approver_id = :approverId`, { approverId: req.userId })
      .leftJoinAndSelect(
        sqb =>
          sqb
            .select(`al.step_id, count(*) as count`)
            .from(ApprovalLine, 'al')
            .where(`al.status = 'REJECTED'`)
            .groupBy(`al.step_id`),
        'rej_al',
        `rej_al.step_id = as.id`,
      )
      .leftJoinAndSelect(
        sqb =>
          sqb
            .select(`al.step_id, count(*) as count`)
            .from(ApprovalLine, 'al')
            .where(`al.status is null`)
            .groupBy(`al.step_id`),
        'no_act_al',
        `no_act_al.step_id = as.id`,
      )
      .where(`rej_al.count = 0 and no_act_al.count > 0`)
      .getMany()

    res.json(requests)
  })

  app.post('/approval-request/approve/:approvalLineId', async (req, res) => {
    if (!req.userId) {
      throw new Error(`사용자 아이디가 없습니다.`)
    }
    const approvalLineRepo = AppDataSource.getRepository(ApprovalLine)
    const approvalLine = await approvalLineRepo.findOneByOrFail({
      id: req.params.approvalLineId,
      approver: { id: req.userId },
    })
    approvalLine.comment = req.body.comment ?? null
    approvalLine.status = ApprovalLineStatus.APPROVED
    const approvedApprovalLine = await approvalLineRepo.save(approvalLine)

    res.json(approvedApprovalLine)
  })

  app.post('/approval-request/reject/:approvalLineId', async (req, res) => {
    if (!req.userId) {
      throw new Error(`사용자 아이디가 없습니다.`)
    }
    const approvalLineRepo = AppDataSource.getRepository(ApprovalLine)
    const approvalLine = await approvalLineRepo.findOneByOrFail({
      id: req.params.approvalLineId,
      approver: { id: req.userId },
    })
    approvalLine.comment = req.body.comment ?? null
    approvalLine.status = ApprovalLineStatus.REJECTED
    const rejectedApprovalLine = await approvalLineRepo.save(approvalLine)

    res.json(rejectedApprovalLine)
  })

  app.post('/approval-request/request', async (req, res) => {
    const { content, title } = req.body

    const approvalSteps = req.body.approvalSteps.map((approvalStep: ApprovalStep) =>
      AppDataSource.getRepository(ApprovalStep).create({
        lines: approvalStep.lines.map(approvalLine =>
          AppDataSource.getRepository(ApprovalLine).create({
            id: randomUUID(),
            approver: approvalLine.approver,
          }),
        ),
        id: randomUUID(),
        type: approvalStep.type,
      }),
    )

    const savedRequests = await AppDataSource.getRepository(ApprovalRequest).save({
      id: randomUUID(),
      title,
      type: req.body.requestType,
      content,
      steps: approvalSteps,
      currentApprovalStep: approvalSteps[0],
      requester: users.find(user => user.name === 'requester'),
    })

    res.json(savedRequests)
  })

  app.get('/', (req: Request, res: Response) => {
    res.send('hello world!!!')
  })

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ message: err.message })
  })

  app.listen(port, () => {
    console.log(`Server is running at https://localhost:${port}`)
  })
}
