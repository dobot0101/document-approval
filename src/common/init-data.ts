import { AppDataSource } from './data-source'
import { User } from '../entities/User.entity'

export const users = [
  {
    id: '0c624610-1b93-47ea-b7d8-1bf03f8b052a',
    email: 'tester@test.com',
    name: 'requester',
    password: 'test',
  },
  {
    id: '2a21208d-1802-4a16-b51b-edf8068edb36',
    email: 'tester@test.com',
    name: 'reviewer',
    password: 'test',
  },
  {
    id: 'dcbd8e71-1f0d-4da4-9230-625aca77118a',
    email: 'tester@test.com',
    name: 'approver',
    password: 'test',
  },
]

/**
 * 유저 테스트 데이터 초기화
 */
export async function initTestData() {
  await AppDataSource.getRepository(User).save(users)
  // console.log(await AppDataSource.getRepository(User).find())
}
