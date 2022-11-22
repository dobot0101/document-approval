import 'reflect-metadata'
import { configs } from './common/configs'
import express, { Express, NextFunction, Request, Response } from 'express'
import { createDataSource } from './common/data-source'
import { initTestData } from './common/init-data'
import approvalRequestRouter from './controllers/ApprovalRequest.controller'
import authRouter from './controllers/Auth.controller'

async function main() {
  const AppDataSource = createDataSource()
  await AppDataSource.initialize()
  await initTestData()
  initServer()
}

main().catch(error => console.log(error))

/**
 * express 초기화
 */
function initServer() {
  const app: Express = express()
  const port = configs.PORT
  app.use(express.json())

  app.get('/', (req: Request, res: Response) => {
    res.send('hello world!!!')
  })

  // 인증(회원가입, 로그인)
  app.use('/auth', authRouter)

  // 결재
  app.use('/approval-request', approvalRequestRouter)

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ message: err.message })
  })

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
  })
}
