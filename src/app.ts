import 'reflect-metadata'
import express, { Express, NextFunction, Request, Response } from 'express'
import { configs } from './configs'
import { AppDataSource } from './data-source'
import { initTestData } from './init-data'
import authRouter from './routers/Auth'
import approvalRequestRouter from './routers/ApprovalRequest'

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

  app.get('/', (req: Request, res: Response) => {
    res.send('hello world!!!')
  })

  app.use('/auth', authRouter)
  app.use('/approval-request', approvalRequestRouter)

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ message: err.message })
  })

  app.listen(port, () => {
    console.log(`Server is running at https://localhost:${port}`)
  })
}
