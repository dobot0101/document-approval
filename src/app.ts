import 'reflect-metadata'
import { configs } from './configs'
import { randomUUID } from 'crypto'
import express, { Express, Request, Response } from 'express'
import { AppDataSource } from './data-source'
import { User } from './typeorm/entity/User'

AppDataSource.initialize()
  .then(async () => {
    console.log('Inserting a new user into the database...')
    const user = new User()
    user.id = randomUUID()
    user.name = 'tester name'
    await AppDataSource.manager.save(user)
    console.log('Saved a new user with id: ' + user.id)

    console.log('Loading users from the database...')
    const users = await AppDataSource.manager.find(User)
    console.log('Loaded users: ', users)

    // Here you can setup and run express / fastify / any other framework.
    const app: Express = express()
    const port = configs.PORT

    app.get('/', (req: Request, res: Response) => {
      res.send('Express + TypeScript Server')
    })

    app.listen(port, () => {
      console.log(`Server is running at https://localhost:${port}`)
    })
  })
  .catch(error => console.log(error))
