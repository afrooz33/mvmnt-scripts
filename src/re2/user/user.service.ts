import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { Re2UserEntity } from '@app/src/re2/user/entities/re2-user.entity'

@Injectable()
export class UserService extends MyService<Re2UserEntity> {
  constructor(
    @InjectRepository(Re2UserEntity)
    protected readonly userRepository: Repository<Re2UserEntity>,
  ) {
    super(userRepository, 're2')
  }
}
