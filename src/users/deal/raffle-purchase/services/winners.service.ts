import { Not } from 'typeorm'
import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { ErrorKey, Query, Status } from '@app/src/shared/enums'
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
            user: { id: userId },
            deal_type: DealType.RAFFLE,
            status: Not(Status.DELETED),
          },
          select: ['id', 'name', 'status', 'deal_type'],
        },
      ],
      errorMessage: ErrorKey.DEAL_NOT_FOUND,
    })

    // Build query to fetch winners with necessary relations
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
      'data.id id',
      'winner.id winner_id',
      'winner.quantity quantity',
      'user.id user_id',
      'user.display_name display_name',
      'user.username username',
      'profile.profile_images profile_images',
      'profile_images.url profile_images_url',
      'prize.id prize_id',
      'prize.rank prize_rank',
      'prize.name prize_name',
      'winner.created purchase_date',
    ])

    const winners = await this.rawPaginate(results)

    const transformed = winners.data.reduce((acc, winner) => {
      const existing = acc.find((item) => item.user_id === winner.winner_id)

      if (existing) {
        existing.prize.push({
          rank: winner.prize.rank,
          name: winner.prize.name,
        })
      } else {
        acc.push({
          id: winner.id,
          user: {
            id: winner.user_id,
            display_name: winner.display_name,
            username: winner.username,
            profile: {
              profile_images: winner.profile_images_url || null,
            },
          },
          prize: [
            {
              rank: winner.prize_rank,
              name: winner.prize_name,
            },
          ],
          quantity: winner.quantity,
          purchase_date: winner.purchase_date,
        })
      }

      return acc
    }, [])

    return {
      data: transformed,
      meta: winners.meta,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
