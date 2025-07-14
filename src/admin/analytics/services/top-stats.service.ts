import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GenerateDateRangeFilter, GetDealSalePurchaseQuery } from '@app/src/shared/sql'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { DateFilterQueryDto } from '@app/src/admin/analytics/dto'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'
import { AccountStatus, UserAccountType } from '@app/src/users/user/enums'
import { FundraiserStatus, FundraiserType } from '@app/src/re2/fundraisers/enums'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'

export default async function (query: DateFilterQueryDto): Promise<SuccessRO> {
  try {
    const dateFilter = GenerateDateRangeFilter({
      query: {
        date_filter: {
          start: query?.date_filter?.start,
          end: query?.date_filter?.end,
        },
      },
      field: 'created',
      condition: ' AND ',
    })

    const dealEndDateFilter = GenerateDateRangeFilter({
      query: {
        date_filter: {
          start: query?.date_filter?.start,
          end: query?.date_filter?.end,
        },
      },
      field: 'end_date',
      condition: ' AND ',
      isAppend: true,
    })

    const dealStartDateFilter = GenerateDateRangeFilter({
      query: {
        date_filter: {
          start: query?.date_filter?.start,
          end: query?.date_filter?.end,
        },
      },
      field: 'start_date',
      condition: ' AND ',
      isAppend: true,
    })

    const data = await this.entityManager.query(`SELECT 
      total_users,
      total_individual_personals,
      total_individual_influencers,
      total_business_users,
      total_open_auctions,
      total_ended_auctions,
      total_auction_sell,
      total_auction_donation,
      total_open_buynow,
      total_ended_buynow,
      total_buynow_sales,
      total_buynow_donation,
      total_open_raffle,
      total_ended_raffle,
      total_raffle_sales,
      total_raffle_donation,
      total_deal_donation,
      total_raised_funds,
      total_sales,
      total_integration_donation,
      total_fundraiser_form_donation,
      total_fundraiser_page_donation,
      (total_auction_sell + total_buynow_sales + total_raffle_sales) - total_deal_donation AS seller_profit,
      total_fundraiser_form_count,
      total_fundraiser_page_count,
      total_integration_count
    FROM (
      SELECT 
        COALESCE((
          SELECT COUNT("id") 
          FROM "users" 
          WHERE "account_status" != '${AccountStatus.DELETED}'${dateFilter}
        ), 0) AS total_users, 
        COALESCE((
          SELECT COUNT("id") 
          FROM "users" 
          WHERE "account_status" != '${AccountStatus.DELETED}'
          AND "account_type" = '${UserAccountType.INDIVIDUAL_PERSONAL}'${dateFilter}
        ), 0) AS total_individual_personals, 
        COALESCE((
          SELECT COUNT("id") 
          FROM "users" 
          WHERE "account_status" != '${AccountStatus.DELETED}'
          AND "account_type" = '${UserAccountType.INDIVIDUAL_INFLUENCER}'${dateFilter}
        ), 0) AS total_individual_influencers, 
        COALESCE((
          SELECT COUNT("id") 
          FROM "users" 
          WHERE "account_status" != '${AccountStatus.DELETED}'${dateFilter}
          AND "account_type" IN (
            '${UserAccountType.BUSINESS_COMPANY}',
            '${UserAccountType.BUSINESS_SOLE_PROPRIETOR}')
        ), 0) AS total_business_users, 
        COALESCE((
          SELECT COUNT("id") 
          FROM "deals" 
          WHERE "status" = '${DealStatus.ON_DEAL}'${dealStartDateFilter}
          AND "deal_type" = '${DealType.AUCTION}'
        ), 0) AS total_open_auctions, 
        COALESCE((
          SELECT COUNT("id") 
          FROM "deals" 
          WHERE "status" = '${DealStatus.ENDED}'${dealStartDateFilter}
          AND "deal_type" = '${DealType.AUCTION}'
        ), 0) AS total_ended_auctions, 
        COALESCE((
          SELECT SUM("total_amount") 
          FROM "user_deal_bids" 
          WHERE "status" = '${BidStatus.COMPLETED}'${dateFilter}
        ), 0) AS total_auction_sell, 
        COALESCE((
          SELECT SUM("donations"."amount") 
          FROM "user_donations" "donations" 
          INNER JOIN "user_deal_item_payment" "payment"
            ON "donations"."userDealItemPaymentId" = "payment"."id"
          WHERE "donations"."status" IN (
            '${DONATION_STATUS.COMPLETED}',
            '${DONATION_STATUS.SETTLED}'
          )${dateFilter}
          AND "payment"."dealId" IN (
            SELECT "id" 
            FROM "deals" 
            WHERE "deal_type" = '${DealType.AUCTION}'
          )
        ), 0) AS total_auction_donation, 
        COALESCE((
          SELECT COUNT("id") 
          FROM "deals" 
          WHERE "status" = '${DealStatus.ON_DEAL}'${dealStartDateFilter}
          AND "deal_type" = '${DealType.BUYNOW}'
        ), 0) AS total_open_buynow, 
        COALESCE((
          SELECT COUNT("id") 
          FROM "deals" 
          WHERE "status" = '${DealStatus.ENDED}'${dealEndDateFilter}
          AND "deal_type" = '${DealType.BUYNOW}'
        ), 0) AS total_ended_buynow, 
        (${GetDealSalePurchaseQuery({
          dealType: DealType.BUYNOW,
          dateFilter: query.date_filter,
        })}) AS total_buynow_sales, 
        COALESCE((
          SELECT SUM("donations"."amount") 
          FROM "user_donations" "donations" 
          INNER JOIN "user_deal_item_payment" "payment"
            ON "donations"."userDealItemPaymentId" = "payment"."id"
          WHERE "donations"."status" IN (
            '${DONATION_STATUS.COMPLETED}',
            '${DONATION_STATUS.SETTLED}'
          )${dateFilter}
          AND "payment"."dealId" IN (
            SELECT "id" 
            FROM "deals" 
            WHERE "deal_type" = '${DealType.BUYNOW}'
          )
        ), 0) AS total_buynow_donation, 
        COALESCE((
          SELECT COUNT("id") 
          FROM "deals" 
          WHERE "status" = '${DealStatus.ON_DEAL}'
          AND "deal_type" = '${DealType.RAFFLE}'
        ), 0) AS total_open_raffle, 
        COALESCE((
          SELECT COUNT("id") 
          FROM "deals" 
          WHERE "status" = '${DealStatus.ENDED}' 
          AND "deal_type" = '${DealType.RAFFLE}'
        ), 0) AS total_ended_raffle,
        (${GetDealSalePurchaseQuery({
          dealType: DealType.RAFFLE,
          dateFilter: query.date_filter,
        })}) AS total_raffle_sales, 
        COALESCE((
          SELECT SUM("donations"."amount") 
          FROM "user_donations" "donations" 
          INNER JOIN "user_deal_item_payment" "payment"
            ON "donations"."userDealItemPaymentId" = "payment"."id"
          WHERE "donations"."status" IN (
            '${DONATION_STATUS.COMPLETED}',
            '${DONATION_STATUS.SETTLED}'
          )${dateFilter}
          AND "payment"."dealId" IN (
            SELECT "id" 
            FROM "deals" 
            WHERE "deal_type" = '${DealType.RAFFLE}'
          )
        ), 0) AS total_raffle_donation, 
        COALESCE((
          SELECT SUM("donations"."amount") 
          FROM "user_donations" "donations" 
          INNER JOIN "user_deal_item_payment" "payment"
            ON "donations"."userDealItemPaymentId" = "payment"."id"
          WHERE "donations"."status" IN (
            '${DONATION_STATUS.COMPLETED}',
            '${DONATION_STATUS.SETTLED}'
          )${dateFilter}
          AND "payment"."dealId" IS NOT NULL
        ), 0) AS total_deal_donation, 
        COALESCE((
          SELECT SUM("donations"."amount") 
          FROM "user_donations" "donations" 
          INNER JOIN "user_deal_item_payment" "payment"
            ON "donations"."userDealItemPaymentId" = "payment"."id" 
          WHERE "donations"."status" IN (
            '${DONATION_STATUS.COMPLETED}',
            '${DONATION_STATUS.SETTLED}'
          )${dateFilter}
          AND "donations"."reason" = '${DonationType.DIRECT_DONATION}'
        ), 0) AS total_raised_funds,
        (${GetDealSalePurchaseQuery({
          dateFilter: query.date_filter,
        })}) AS total_sales,
        (
          SELECT COALESCE(SUM("donations"."amount"), 0)
          FROM "user_donations" "donations"
          WHERE "donations"."status" IN (
            '${DONATION_STATUS.COMPLETED}',
            '${DONATION_STATUS.SETTLED}'
          ) AND "donations"."reason" ='${DonationType.FUNDRAISER_FORM}'
        ) AS total_fundraiser_form_donation,
        (
          SELECT COALESCE(SUM("donations"."amount"), 0)
          FROM "user_donations" "donations"
          WHERE "donations"."status" IN (
            '${DONATION_STATUS.COMPLETED}',
            '${DONATION_STATUS.SETTLED}'
          ) AND "donations"."reason" ='${DonationType.FUNDRAISER_PAGE}'
        ) AS total_fundraiser_page_donation,
        (
          SELECT COALESCE(SUM("donations"."amount"), 0)
          FROM "user_donations" "donations"
          WHERE "donations"."status" IN (
            '${DONATION_STATUS.COMPLETED}',
            '${DONATION_STATUS.SETTLED}'
          ) AND "donations"."reason" IN (
            '${DonationType.INTEGRATION_CART_BANNER}',
            '${DonationType.INTEGRATION_CART_DRAWER}',
            '${DonationType.INTEGRATION_SALES_PORTION}'
          )
        ) AS total_integration_donation,
        (
          SELECT COALESCE(COUNT("id"), 0)
          FROM "re2_fundraisers"
          WHERE "type" = '${FundraiserType.FORM}' AND "status" NOT IN (
            '${FundraiserStatus.DELETED}',
            '${FundraiserStatus.DRAFT}'
          )${dateFilter}
        ) AS total_fundraiser_form_count,
        (
          SELECT COALESCE(COUNT("id"), 0)
          FROM "re2_fundraisers"
          WHERE "type" = '${FundraiserType.PAGE}' AND "status" NOT IN (
            '${FundraiserStatus.DELETED}',
            '${FundraiserStatus.DRAFT}'
          )${dateFilter}
        ) AS total_fundraiser_page_count,
        (
        SELECT
          COALESCE (SUM("count")) FROM
          (
            SELECT COALESCE(COUNT("id"), 0) AS "count" FROM "re2_shopify_cart_banner_settings" cb WHERE "status" != '${
              IntegrationStatus.DELETED
            }'${dateFilter}
            UNION ALL
            SELECT COALESCE(COUNT("id"), 0) AS "count" FROM "re2_shopify_cart_drawer_settings" cd WHERE "status" != '${
              IntegrationStatus.DELETED
            }'${dateFilter}
            UNION ALL
            SELECT COALESCE(COUNT("id"), 0) AS "count" FROM "re2_shopify_sale_portion_settings" sp WHERE "status" != '${
              IntegrationStatus.DELETED
            }'${dateFilter}
          ) AS total_integration_count
        ) AS total_integration_count
    ) AS aggregated_data`)

    return {
      success: true,
      data: data[0],
      message: '',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
