import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { SuccessRO } from '@app/src/shared/dto'
import { AccountStatus } from '@app/src/users/user/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { historyService, manualIntegrationService } from './services'

@Injectable()
export class Re2SettingsService extends MyService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserDonationsEntity)
    private readonly userDonationsRepository: Repository<UserDonationsEntity>,
    @InjectRepository(UserPointsEntity)
    private readonly userPointsRepository: Repository<UserPointsEntity>,
  ) {
    super(userRepository, 'user/re2-settings')
  }

  async change(userId: string, action: string): Promise<SuccessRO> {
    const user = await this.userRepository.findOne({
      where: { id: userId, account_status: AccountStatus.ENABLED },
      select: {
        id: true,
        sync_re2_donations: true,
      },
    })

    if (action === 'enable') {
      user.sync_re2_donations = true
    } else if (action === 'disable') {
      user.sync_re2_donations = false
    }

    await this.userRepository.update(user.id, { sync_re2_donations: user.sync_re2_donations })

    return {
      success: true,
      message: 'RE2 donations sync updated',
    }
  }

  history = historyService.bind(this)
  manualIntegration = manualIntegrationService.bind(this)
}
