import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  // dropSchema: true,
  logging: true,
  entities: ['dist/entities/*.js'],
  migrations: [],
  subscribers: [],
  namingStrategy: new SnakeNamingStrategy(),
})
