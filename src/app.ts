import 'reflect-metadata'
import express, { Express, NextFunction, Request, Response } from 'express'
import { createDataSource } from './common/data-source'
import { initTestData } from './common/init-data'
import approvalRequestRouter from './controllers/ApprovalRequest.controller'
import userRouter from './controllers/User.controller'
import { ValidationError } from './common/error-types'
import * as redis from 'redis'

async function main() {
  const AppDataSource = createDataSource()
  await AppDataSource.initialize()
  await initTestData()
  initServer()

  // redis
  const client = redis.createClient({ url: 'redis://redis:6379' })
  client.on('error', (err: unknown) => {
    let message
    if (err instanceof Error) {
      message = err.message
    } else {
      message = String(err)
    }
    throw new Error(`Redis Client Error: ${message}`)
  })

  await client.connect()
  await client.set('name', 'dobot')
  const name = await client.get('name')
  await client.disconnect()
}

main().catch(error => console.log(error))

/**
 * express 초기화
 */
function initServer() {
  const app: Express = express()
  const port = 3000
  app.use(express.json())

  app.get('/', (req: Request, res: Response) => {
    res.send('hello world!!!')
  })

  // 인증(회원가입, 로그인)
  app.use('/user', userRouter)

  // 결재
  app.use('/approval-request', approvalRequestRouter)

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500
    if (err instanceof ValidationError) {
      statusCode = 400
    }
    res.status(statusCode).json({ message: err.message })
  })

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
  })
}
