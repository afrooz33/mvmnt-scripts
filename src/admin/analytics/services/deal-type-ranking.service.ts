import { ExportToCsv } from 'export-to-csv'
import { NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { GetDealFirstImageQuery, GetDealSalePurchaseQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DealType } from '@app/src/users/deal/enums'
import { DateFilterQueryDto } from '@app/src/admin/analytics/dto/date-filter-query.dto'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'

export default async function (
  deal_type: DealType,
  query: DateFilterQueryDto,
  isExport: boolean = false,
): Promise<PaginateRO> {
  try {
    let deal_image = `(${GetDealFirstImageQuery('"deal"."deal_type"', '"deal"."id"')})`

    deal_image = deal_image.replace(' AS "deal_image"', '')

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.donationsRepository)
      .addRelation('user_deal_item_payment')
      .addRelation('user_deal_item_payment.deal')
      .addRelation('user_deal_item_payment.payment')
      .addRelation('deal.user')
      .addRelation('user.profile')
      .create()

    results.condition.andWhere('"user_deal_item_payment"."status" IN (:...status)', {
      status: [PAYMENT_STATUS.DONATION_SETTLED, PAYMENT_STATUS.COMPLETED],
    })

    results.condition.andWhere('"payment"."deal_type" = :deal_type', { deal_type })

    results.condition.select([
      'data.id',
      'COALESCE(data.amount, 0) as net_donation',
      'COALESCE(data.amount + data.system_fees, 0) as gross_donation',
      `(${GetDealSalePurchaseQuery({
        select: 'COALESCE(COUNT("payment"."userId"), 0)',
        dealType: deal_type,
        dateFilter: query.date_filter,
        dealId: '"user_deal_item_payment"."dealId"',
      })}) participants`,
      `(
        ${GetDealSalePurchaseQuery({
          select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
          dealType: deal_type,
          dealId: '"user_deal_item_payment"."dealId"',
          dateFilter: query.date_filter,
        })}
      ) total_sales`,
      `(SELECT
        JSON_BUILD_OBJECT(
          'id', "deal"."id",
          'name', "deal"."name",
          'status', "deal"."status",
          'deal_image', ${deal_image},
          'seller', JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', "user"."id",
              'username', "user"."username",
              'display_name', "user"."display_name",
              'account_type', "user"."account_type",
              'account_status', "user"."account_status",
              'is_verified', "user"."is_verified",
              'social_accounts', "profile"."social_accounts"
            )
          ) FILTER (WHERE "user"."id" IS NOT NULL)
        )
      ) deal_info`,
      `RANK() OVER (ORDER BY (
        ${GetDealSalePurchaseQuery({
          select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
          dealType: deal_type,
          dealId: '"user_deal_item_payment"."dealId"',
          dateFilter: query.date_filter,
        })}
      ) DESC) AS rank`,
    ])

    results.condition.groupBy('"data"."id", "user_deal_item_payment"."dealId", "deal"."id"')

    results.condition.orderBy(
      `(
        ${GetDealSalePurchaseQuery({
          select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
          dealType: deal_type,
          dealId: '"user_deal_item_payment"."dealId"',
          dateFilter: query.date_filter,
        })}
      )`,
      'DESC',
    )

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      if (!data.length) {
        throw new NotFoundException(ErrorKey.NO_CSV_DATA_FOUND)
      }

      const csvData = data.map((item: any) => ({
        'Net Donation': item.net_donation,
        'Gross Donation': item.gross_donation,
        Participants: item.participants,
        'Total Sales': item.total_sales,
        Deal: JSON.stringify(item.deal_info),
        Rank: item.rank,
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
