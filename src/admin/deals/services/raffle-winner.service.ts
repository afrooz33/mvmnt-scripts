import { ExportToCsv } from 'export-to-csv'
import { BadRequestException } from '@nestjs/common'
import { ICsvRaffleWinner, QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { RaffleWinnerDto } from '@app/src/admin/deals/dto'

export default async function (
  id: string,
  query: RaffleWinnerDto,
  isExport = false,
): Promise<PaginateRO | ICsvRaffleWinner> {
  try {
    const results: QueryBuilderDataInterface = await new QueryBuilder(query)
      .useQuery(this.raffleWinnerRepository)
      .addRelation(Query.RAFFLE_WINNER)
      .addRelation(Query.RAFFLE_WINNER_USER)
      .addRelation(Query.USER_PROFILE)
      .addRelation(Query.PROFILE_IMAGES)
      .addRelation(Query.RAFFLE_WINNER_PRIZE)
      .addRelation(Query.RAFFLE_WINNER_PRIZE_RAFFLES)
      .create()

    results.condition.andWhere('raffles.deal = :id', { id })

    results.condition.select([
      'data',
      'raffles',
      'winner',
      'prize',
      'user.id',
      'user.username',
      'user.display_name',
      'user.account_type',
      'profile',
      'profile_images',
    ])

    if (query?.keyword) {
      results.condition.andWhere(
        '(user.username ILIKE :keyword OR user.display_name ILIKE :keyword)',
        { keyword: `%${query.keyword}%` },
      )
    }

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      const csvData: ICsvRaffleWinner[] = data.map(this.toCSVRaffleWinner)

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    if (query?.raffle_winner_id) {
      results.condition.andWhere('"data"."id" = :raffleWinnerId', {
        raffleWinnerId: query.raffle_winner_id,
      })

      return await results.condition.getOne()
    }

    return await this.paginate(results)
  } catch (error) {
    throw new BadRequestException(error.message ?? error.toString())
  }
}
