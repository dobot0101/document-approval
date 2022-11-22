import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { ApprovalLine } from '../entities/ApprovalLine.entity'
import { ApprovalRequest } from '../entities/ApprovalRequest.entity'
import { User } from '../entities/User.entity'
import { configs } from './configs'

export let AppDataSource: DataSource
export function createDataSource(isTest?: boolean) {
  AppDataSource = new DataSource({
    type: 'mysql',
    host: configs.DB_HOST,
    port: Number(configs.DB_PORT),
    username: configs.DB_USERNAME,
    password: configs.DB_PASSWORD,
    // 테스트 코드 실행 시 TEST용 DB로 초기화 한다.
    database: isTest ? configs.TEST_DB_DATABASE : configs.DB_DATABASE,
    synchronize: true,
    dropSchema: true,
    logging: true,
    // entities: ['dist/entities/*.js', 'src/entities/*.ts'],
    // entities: ['src/**/*{.entity.ts}'],
    entities: [User, ApprovalLine, ApprovalRequest],
    migrations: [],
    subscribers: [],
    namingStrategy: new SnakeNamingStrategy(),
  })
  return AppDataSource
}
