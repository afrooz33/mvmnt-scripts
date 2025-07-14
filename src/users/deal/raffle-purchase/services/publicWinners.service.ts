import { Not } from 'typeorm'
import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { ErrorKey, Status, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DealType } from '@app/src/users/deal/enums'

export default async function (
  query: MyPaginateDto,
  dealId: string,
  userId: string,
): Promise<PaginateRO> {
  try {
    await this.dealService.documentExists({
      condition: [
        {
          where: {
            id: dealId,
            status: Not(Status.DELETED),
            deal_type: DealType.RAFFLE,
          },
          select: ['id', 'name', 'status', 'deal_type'],
        },
      ],
      errorMessage: ErrorKey.DEAL_NOT_FOUND,
    })

    const results: QueryBuilderDataInterface = await new QueryBuilder(query)
      .useQuery(this.raffleWinnerRepository)
      .addRelation(Query.RAFFLE_WINNER)
      .addRelation(Query.RAFFLE_WINNER_USER)
      .addRelation(Query.USER_PROFILE)
      .addRelation(Query.PROFILE_IMAGES)
      .addRelation(Query.RAFFLE_WINNER_PRIZE)
      .addRelation(Query.RAFFLE_WINNER_PRIZE_RAFFLES)
      .addRelation(`${Query.RAFFLE_WINNER}.${Query.DEAL}`)
      .create()

    results.condition.andWhere('"deal"."id" = :id', { id: dealId })

    results.condition.select([
      'data.id',
      'winner.id',
      'prize.id',
      'prize.rank',
      'user.id',
      'user.username',
      'user.is_verified',
      'user.display_name',
      'user.account_type',
      'profile.id',
      'profile_images.id',
      'profile_images.url',
    ])

    results.condition.orderBy('prize.rank', 'DESC')

    const result = await this.customPaginate(results)

    const response = {
      ...result,
      me: null,
    }

    if (userId) {
      const userWinning = await this.raffleWinnerRepository.findOne({
        where: {
          winner: {
            user: { id: userId },
            deal: { id: dealId },
          },
        },
        relations: [Query.RAFFLE_WINNER, Query.RAFFLE_WINNER_PRIZE],
        select: {
          id: true,
          prize: {
            id: true,
            rank: true,
          },
        },
      })

      if (userWinning) {
        response.me = {
          prize: userWinning.prize.toResponseObject(),
        }
      }
    }

    return response
  } catch (error) {
    return HandleErrors(error)
  }
}
