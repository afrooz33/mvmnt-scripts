import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { SystemFeeEntity } from './entities/system-fee.entity'
import { createService } from './services'

@Injectable()
export class SystemFeeService extends MyService<SystemFeeEntity> {
  constructor(
    @InjectRepository(SystemFeeEntity)
    private readonly systemFeeRepository: Repository<SystemFeeEntity>,
  ) {
    super(systemFeeRepository, 'system-fees')
  }

  findByUserOrDefault = async (user: string | null): Promise<SystemFeeEntity> => {
    const systemFee: SystemFeeEntity = await this.findOne({
      where: {
        user: {
          id: user,
        },
      },
    })

    if (systemFee) {
      return systemFee
    }

    return this.findOne({
      where: {
        user: null,
      },
    })
  }

  create = createService.bind(this)
}
