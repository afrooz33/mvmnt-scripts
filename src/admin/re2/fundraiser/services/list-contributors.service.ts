import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryContributorDto } from '@app/src/admin/re2/fundraiser/dto'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DonationType } from '@app/src/donations/enums'
import { UserAccountType } from '@app/src/users/user/enums'
import { AccountIntegration } from '@app/src/admin/re2/fundraiser/enums'

export default async function (query: QueryContributorDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userDonationsRepository)
      .addRelation('user')
      .addRelation('user.profile')
      .addRelation('profile.profile_images')
      .addRelation('user_donation_payment')
      .addRelation('payment_currency')
      .create()

    if (query.source === 'fundraiser') {
      results.condition.andWhere('"data"."reason" IN (:...reasons)', {
        reasons: [DonationType.FUNDRAISER_FORM, DonationType.FUNDRAISER_PAGE],
      })
    } else if (query.source === 'integration') {
      results.condition.andWhere('"data"."reason" IN (:...reasons)', {
        reasons: [
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
      })
    }

    results.condition.select([
      'data.id id',
      'data.reason reason',
      'data.is_recurring is_recurring',
      'data.amount amount',
      'data.system_fees system_fees',
      'data.gas_fees gas_fees',
      'data.created created',
      'user.id user_id',
      'user.email user_email',
      'user.display_name user_display_name',
      'user.username user_username',
      'user.account_status user_account_status',
      'user.account_type user_account_type',
      'profile_images.url profile_image',
      'payment_currency.id payment_currency_id',
      'payment_currency.name payment_currency_name',
      'payment_currency.logo_uri payment_currency_logo_uri',
    ])

    if (query?.keyword) {
      results.condition.andWhere(
        '("user"."display_name" ILIKE :keyword OR "user"."username" ILIKE :keyword OR "user"."email" ILIKE :keyword)',
        {
          keyword: `%${query.keyword}%`,
        },
      )
    }

    if (query.account_integration === AccountIntegration.NA) {
      results.condition.andWhere('"user"."account_type" = :account_type', {
        account_type: UserAccountType.RE2_SHOPIFY_TEMP_USER,
      })
    } else if (query.account_integration === AccountIntegration.INTEGRATED) {
      results.condition.andWhere('"user"."account_type" != :account_type', {
        account_type: UserAccountType.RE2_SHOPIFY_TEMP_USER,
      })
    }

    if (query?.gross_donation?.start && query?.gross_donation?.end) {
      results.condition.andWhere('"data"."amount" BETWEEN :start AND :end', {
        start: query.gross_donation.start,
        end: query.gross_donation.end,
      })
    } else if (query?.gross_donation?.start) {
      results.condition.andWhere('"data"."amount" >= :start', {
        start: query.gross_donation.start,
      })
    } else if (query?.gross_donation?.end) {
      results.condition.andWhere('"data"."amount" <= :end', {
        end: query.gross_donation.end,
      })
    }

    if (query?.start_date?.leading_date && query?.start_date?.trailing_date) {
      results.condition.andWhere('"data"."created" BETWEEN :start AND :end', {
        start: query.start_date.leading_date,
        end: query.start_date.trailing_date,
      })
    } else if (query?.start_date?.leading_date) {
      results.condition.andWhere('"data"."created" >= :start', {
        start: query.start_date.leading_date,
      })
    } else if (query?.start_date?.trailing_date) {
      results.condition.andWhere('"data"."created" <= :end', {
        end: query.start_date.trailing_date,
      })
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
