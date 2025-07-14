import { Not, In } from 'typeorm'
import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryBuilderDataInterface, ICsvAdminDealDonors } from '@app/src/shared/interfaces'
import { DealStatus } from '@app/src/users/deal/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { PurchaseHistoryDto } from '@app/src/admin/deals/dto'

export default async function (
  id: string,
  query: PurchaseHistoryDto,
  isExport = false,
): Promise<PaginateRO> {
  try {
    await this.documentExists({
      condition: [
        {
          where: {
            id,
            status: Not(
              In([
                DealStatus.DRAFT,
                DealStatus.DELETED,
                DealStatus.SCHEDULED,
                DealStatus.DELETE_REQUESTED,
              ]),
            ),
          },
          select: ['id', 'name', 'deal_type'],
        },
      ],
      message: ErrorKey.DEAL_NOT_FOUND,
    })

    const results: QueryBuilderDataInterface = await new QueryBuilder(query)
      .useQuery(this.userDealPaymentRepository)
      .addRelation('user')
      .addRelation('user.profile')
      .addRelation('profile.profile_images')
      .addRelation('payment_currency')
      .create()

    results.condition.select([
      'data.id id',
      'data.created purchase_date',
      'data.deal_amount total_purchase',
      `JSON_BUILD_OBJECT(
        'id', payment_currency.id,
        'name', payment_currency.name,
        'logo_uri', payment_currency.logo_uri,
        'address', payment_currency.address
      ) payment`,
      `JSON_BUILD_OBJECT(
        'id', user.id,
        'username', user.username,
        'display_name', user.display_name,
        'account_type', user.account_type,
        'account_status', user.account_status,
        'is_verified', user.is_verified,
        'profile_image', profile_images.url
      ) user`,
      `(
        SELECT
          JSON_BUILD_OBJECT(
            'total_net_donation', COALESCE(SUM("donation"."amount"), 0),
            'total_gross_donation', COALESCE(SUM("donation"."amount") - SUM("donation"."system_fees"), 0)
          )
        FROM "user_donations" "donation"
        LEFT JOIN "user_deal_item_payment" "item" ON "item"."id" = "donation"."userDealItemPaymentId"
        WHERE "item"."paymentId" = "data"."id"
      ) donation_details`,
    ])

    results.condition.andWhere(
      `"data"."id" IN (
        SELECT
          "paymentId"
        FROM
          "user_deal_item_payment" "item"
        WHERE "item"."dealId" = :deal_id
          AND "item"."status" IN (:...payment_statuses)
      )`,
      {
        deal_id: id,
        payment_statuses: [PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.DONATION_SETTLED],
      },
    )

    if (query?.keyword) {
      results.condition.andWhere(
        `("user"."username" ILIKE :keyword OR "user"."display_name" ILIKE :keyword OR "user"."email" ILIKE :keyword)`,
        {
          keyword: `%${query.keyword}%`,
        },
      )
    }

    if (query?.total_sales?.start && query?.total_sales?.end) {
      results.condition.andWhere(`"data"."deal_amount" BETWEEN :start AND :end`, {
        start: query.total_sales.start,
        end: query.total_sales.end,
      })
    } else if (query?.total_sales?.start) {
      results.condition.andWhere(`"data"."deal_amount" >= :start`, {
        start: query.total_sales.start,
      })
    } else if (query?.total_sales?.end) {
      results.condition.andWhere(`"data"."deal_amount" <= :end`, {
        end: query.total_sales.end,
      })
    }

    const grossDonation = `(SELECT
        COALESCE(SUM("donation"."amount") - SUM("donation"."system_fees"), 0)
      FROM "user_donations" "donation"
      LEFT JOIN "user_deal_item_payment" "item" ON "item"."id" = "donation"."userDealItemPaymentId"
      WHERE "item"."paymentId" = "data"."id")`

    if (query?.gross_donation?.start && query?.gross_donation?.end) {
      results.condition.andWhere(`${grossDonation} BETWEEN :start AND :end`, {
        start: query.gross_donation.start,
        end: query.gross_donation.end,
      })
    } else if (query?.gross_donation?.start) {
      results.condition.andWhere(`${grossDonation} >= :start`, {
        start: query.gross_donation.start,
      })
    } else if (query?.gross_donation?.end) {
      results.condition.andWhere(`${grossDonation} <= :end`, {
        end: query.gross_donation.end,
      })
    }

    if (isExport) {
      const data = await results.condition.getRawMany()

      const csvData: ICsvAdminDealDonors[] = data.map((item) => {
        return {
          'Purchase Date': item.purchase_date,
          'Total Purchase': item.total_purchase,
          'Payment Currency': item.payment.name,
          Username: item.user.username,
          'Display Name': item.user.display_name,
          'Account Type': item.user.account_type,
          'Account Status': item.user.account_status,
          'Is Verified': item.user.is_verified,
          'Total Net Donation': item.donation_details.total_net_donation,
          'Total Gross Donation': item.donation_details.total_gross_donation,
        }
      })

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
