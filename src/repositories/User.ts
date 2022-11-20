import { Service } from 'typedi'
import { AppDataSource } from '../data-source'
import { User } from '../typeorm/entity/User'

@Service()
export class UserRepository {
  save(userEntity: User) {
    return AppDataSource.getRepository(User).save(userEntity)
  }
  async getByEmail(email: any) {
    return await AppDataSource.getRepository(User).findOneBy({
      email,
    })
  }
}
