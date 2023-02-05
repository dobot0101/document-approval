import { Service } from 'typedi'
import { UserRepository } from '../repositories/User.repository'
import bcrypt from 'bcrypt'
import { AppDataSource } from '../common/data-source'
import { User } from '../entities/User.entity'
import { randomUUID } from 'crypto'
import { JwtService } from './Jwt.service'
import { ValidationError } from '../common/error-types'

export type LoginInput = {
  email: string
  password: string
}

export type SignupInput = {
  email: string
  password: string
  name: string
}

@Service()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async login(input: LoginInput) {
    const { email, password } = input
    const user = await this.userRepository.getByEmail(email)
    if (!user) {
      throw new ValidationError(`회원이 없습니다.`)
    }

    const same = await bcrypt.compare(password, user.password)
    if (!same) {
      throw new ValidationError(`로그인 정보가 일치하지 않습니다.`)
    }
    const token = JwtService.createJWT(user.id)
    return token
  }

  async signup(input: SignupInput) {
    const { email, password, name } = input
    const user = await this.userRepository.getByEmail(email)
    if (user) {
      throw new ValidationError(`사용 중인 이메일입니다.`)
    }

    const encryptedPassword = await bcrypt.hash(password, 10)
    const userEntity = AppDataSource.getRepository(User).create({
      id: randomUUID(),
      email,
      name,
      password: encryptedPassword,
      approvalLines: null,
      requests: null,
    })
    return this.userRepository.save(userEntity)
  }
}
