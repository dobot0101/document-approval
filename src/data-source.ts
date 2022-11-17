import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from './typeorm/entity/User'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { Document } from './typeorm/entity/Document'
import { ApprovalLine } from './typeorm/entity/ApprovalLine'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: [User, Document, ApprovalLine],
  migrations: [],
  subscribers: [],
  namingStrategy: new SnakeNamingStrategy(),
})
