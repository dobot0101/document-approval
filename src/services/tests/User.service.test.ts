import { JwtPayload } from 'jsonwebtoken'
import Container from 'typedi'
import { AppDataSource, createDataSource } from '../../common/data-source'
import { User } from '../../entities/User.entity'
import { UserService } from '../User.service'
import { JwtService } from '../Jwt.service'

const userService = Container.get(UserService)

beforeAll(async () => {
  createDataSource(true)
  await AppDataSource.initialize()
})

describe('회원 테스트(회원가입/로그인)', () => {
  it('회원 가입한다.', async () => {
    const user = await signupByEmail('test@test.com')
    expect(user instanceof User).toBeTruthy()
  })

  it('로그인한다.', async () => {
    const user = await signupByEmail('test123123@test.com')
    const loginToken = await userService.login({
      email: user.email,
      password: 'test',
    })

    const payload = JwtService.decodeJWT(loginToken) as JwtPayload
    if (!payload.id) {
      throw new Error(`로그인 토큰에 회원 아이디가 없습니다.`)
    }

    expect(payload.id).toEqual(user.id)
  })
})

afterAll(async () => {
  await AppDataSource.dropDatabase()
  await AppDataSource.destroy()
})

async function signupByEmail(email: string) {
  const user = await userService.signup({
    email,
    name: 'tester',
    password: 'test',
  })
  return user
}
