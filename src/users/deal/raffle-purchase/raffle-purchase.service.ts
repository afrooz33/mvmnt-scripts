import { Repository } from 'typeorm'
import { Cron } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import { MyService } from '@app/src/shared/base'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DealStatus } from '@app/src/users/deal/enums'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'
import { DealService } from '@app/src/users/deal/deal.service'
import { UserService } from '@app/src/users/user/user.service'
import { DonationsService } from '@app/src/donations/donations.service'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { SystemFeeService } from '@app/src/admin/system-fee/system-fee.service'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { DealRaffleEntity } from '@app/src/users/deal/entities/deal-raffle.entity'
import { RegionSettingsService } from '@app/src/admin/region-settings/region_settings.service'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { PurchaseStatus } from './enums'
import { RaffleWinnerEntity } from './entities/raffle-winner.entity'
import { RafflePurchaseEntity } from './entities/raffle-purchase.entity'
import {
  buyerService,
  winnersService,
  freeEntryService,
  publicWinnersService,
  entryCalculationService,
} from './services'

@Injectable()
export class RafflePurchaseService extends MyService<RafflePurchaseEntity> {
  constructor(
    @InjectRepository(RafflePurchaseEntity)
    private readonly rafflePurchaseRepository: Repository<RafflePurchaseEntity>,
    @InjectRepository(RaffleWinnerEntity)
    private readonly raffleWinnerRepository: Repository<RaffleWinnerEntity>,
    @InjectRepository(DealRaffleEntity)
    private readonly raffleDealRepository: Repository<DealRaffleEntity>,
    @InjectRepository(UserDealItemPaymentEntity)
    private readonly userDealItemPaymentRepository: Repository<UserDealItemPaymentEntity>,
    private readonly dealService: DealService,
    private readonly userService: UserService,
    private readonly notificationsService: NotificationsService,
    private readonly systemFeeService: SystemFeeService,
    private readonly donationsService: DonationsService,
    private readonly regionSettingsService: RegionSettingsService,
    private readonly userPointsService: UserPointsService,
  ) {
    super(rafflePurchaseRepository, 'user/deal/raffle-purchases')
  }

  buyer = buyerService.bind(this)
  winners = winnersService.bind(this)
  freeEntry = freeEntryService.bind(this)
  publicWinners = publicWinnersService.bind(this)
  entryCalculation = entryCalculationService.bind(this)

  @Cron('0 0 0 * * *')
  async announceRaffleWinners() {
    try {
      const raffles: QueryBuilderDataInterface = new QueryBuilder({})
        .addRelation('raffle_prizes')
        .addRelation('deal')
        .useQuery(this.raffleDealRepository)
        .create()

      raffles.condition.andWhere('DATE("winner_announcement_date") = :date', {
        date: new Date(),
      })

      const results = await raffles.condition.getMany()

      await Promise.all(
        results.map(async (raffle) => {
          const purchases: QueryBuilderDataInterface = new QueryBuilder({})
            .useQuery(this.rafflePurchaseRepository)
            .addFilter('deal', raffle.deal.id)
            .addRelation('user')
            .create()

          const purchaseResults = await purchases.condition.getMany()

          const entryPool: { user: any; purchase: any }[] = []

          purchaseResults.forEach((purchase) => {
            for (let i = 0; i < purchase.quantity; i++) {
              entryPool.push({ user: purchase.user, purchase })
            }
          })

          const winners = []

          for (const prize of raffle.raffle_prizes) {
            for (let i = 0; i < prize.number_of_winners; i++) {
              if (entryPool.length === 0) break

              const winnerIndex = Math.floor(Math.random() * entryPool.length)
              const winnerEntry = entryPool[winnerIndex]

              const userWinsCount = winners.filter(
                (w) => w.winner.user.id === winnerEntry.user.id,
              ).length

              if (userWinsCount < winnerEntry.purchase.quantity) {
                winners.push({
                  winner: winnerEntry.purchase,
                  prize,
                })
              }

              entryPool.splice(winnerIndex, 1)
            }
          }

          await this.raffleWinnerRepository.save(this.raffleWinnerRepository.create(winners))

          await this.rafflePurchaseRepository.update(
            {
              deal: {
                id: raffle.deal.id,
              },
              status: PurchaseStatus.ON_DEAL,
            },
            {
              status: PurchaseStatus.COMPLETED,
            },
          )

          await Promise.all(
            winners.map(async (winner) => {
              await this.notificationsService.create({
                title: "Congratulations! You've won the raffle you participated in!",
                user: {
                  id: winner.winner.user.id,
                },
                type: NotificationType.RAFFLE_WON,
                receiver_type: NotificationReceiverType.USER,
                related_to: NotificationRelatedTo.DEAL,
                data: {
                  deal: raffle.deal.id,
                  deal_name: raffle.deal.name,
                  username: raffle.deal.username,
                  prize: winner.prize,
                },
              })
            }),
          )

          // Mark deal as ended once the raffle is over
          await this.dealService.updateOne({
            id: raffle.deal.id,
            status: DealStatus.ENDED,
          })
        }),
      )
    } catch (error) {
      console.log(error)
    }
  }
}
