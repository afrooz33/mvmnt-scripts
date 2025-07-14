import { ExportToCsv } from 'export-to-csv'
import { GetDealFirstImageQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DealStatus } from '@app/src/users/deal/enums'
import { QueryDto } from '@app/src/users/purchases/dto'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'

export default async function (query: QueryDto, userId: string, isExport?: boolean): Promise<any> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.dealRepository)
      .create()

    results.condition.andWhere('"data"."status" IN (:...status)', {
      status: [DealStatus.ENDED, DealStatus.ON_DEAL],
    })

    results.condition.andWhere(`"data"."userId" = :userId`, {
      userId,
    })

    results.condition.select([
      'data.id as id',
      'data.name as name',
      'data.status as status',
      'data.deal_type as deal_type',
      'user_deal_sold.id as purchase_id',
      'user_deal_sold.status as purchase_status',
      'user_deal_sold.purchase_date as purchase_date',
      `${GetDealFirstImageQuery('data.deal_type', '"data"."id"')}`,
      'buyer.*',
    ])

    results.condition.innerJoinAndSelect(
      `(
        SELECT
          "id",
          "dealId",
          "status",
          "created" as "purchase_date"
        FROM
          "user_deal_item_payment"
        WHERE  "receiverId" = '${userId}'
          AND "status" IN (${PAYMENT_STATUS.COMPLETED}, ${PAYMENT_STATUS.DONATION_SETTLED})
      )`,
      'user_deal_sold',
      'user_deal_sold."dealId" = "data"."id"',
    )

    results.condition.innerJoinAndSelect(
      `(SELECT
        "users"."id",
        "users"."display_name",
        "users"."username",
        (SELECT "images"."url" FROM "images" WHERE "images"."id" = (SELECT "user_profiles"."profileImagesId" FROM "user_profiles" WHERE "user_profiles"."userId" = "users"."id")) as "profile_image"
      FROM
        "users")`,
      'buyer',
      '"buyer"."id" = "user_deal_sold"."userId"',
    )

    if (query?.keyword) {
      results.condition.andWhere(`LOWER("data"."name") ILIKE LOWER(:keyword)`, {
        keyword: `%${query.keyword}%`,
      })
    }

    if (query?.purchase_date?.leading_date) {
      results.condition.andWhere(`DATE("user_deal_sold"."purchase_date") >= :leading_date`, {
        leading_date: query.purchase_date.leading_date,
      })
    }

    if (query?.purchase_date?.trailing_date) {
      results.condition.andWhere(`DATE("user_deal_sold"."purchase_date") <= :trailing_date`, {
        trailing_date: query.purchase_date.trailing_date,
      })
    }

    if (query?.deal_type) {
      results.condition.andWhere(`"data"."deal_type" = :deal_type`, {
        deal_type: query.deal_type,
      })
    }

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      const csvData = data.map((item: any) => ({
        Deal: item.dealId,
        'Deal status': item.status,
        'Purchase date': item.purchase_date,
        'Buyer display name': item.display_name,
        'Buyer username': item.username,
        'Deal name': item.name,
        'Deal type': item.deal_type,
        'Purchase status': item.purchase_status,
      }))

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
