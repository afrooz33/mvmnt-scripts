import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { WalletType } from '@app/src/users/payment-method/enums'
import { QueryDto } from '@app/src/users/wallet-transaction-history/dto'

export default async function show(userId: string, query: QueryDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.historyRepository)
      .addFilter('owner_user', userId)
      .addRelation('affected_wallet')
      .addRelation('currency')
      .addRelation('user_deal_payment')
      .addRelation('user_deal_item_payment')
      .create()

    if (query.is_mvmnt && query.is_mvmnt === 'Y') {
      results.condition.andWhere('"affected_wallet"."type" = :wallet_type', {
        wallet_type: WalletType.SMART_ACCOUNT,
      })
    }

    if (query?.start_date && query?.end_date) {
      results.condition.andWhere('"data"."created" BETWEEN :start_date AND :end_date', {
        start_date: query.start_date,
        end_date: query.end_date,
      })
    } else if (query?.start_date) {
      results.condition.andWhere('"data"."created" >= :start_date', {
        start_date: query.start_date,
      })
    } else if (query?.end_date) {
      results.condition.andWhere('"data"."created" <= :end_date', {
        end_date: query.end_date,
      })
    }

    if (query?.transaction_type) {
      results.condition.andWhere('"data"."transaction_type" = :transaction_type', {
        transaction_type: query.transaction_type,
      })
    }

    if (query?.transaction_category) {
      results.condition.andWhere('"data"."transaction_category" = :transaction_category', {
        transaction_category: query.transaction_category,
      })
    }

    if (query?.wallet) {
      results.condition.andWhere('"data"."affected_wallet" = :wallet', {
        wallet: query.wallet,
      })
    }

    results.condition.select([
      '"data"."id"',
      '"data"."created"',
      '"data"."transaction_type"',
      '"data"."transaction_category"',
      '"data"."amount"',
      '"data"."flow_indicator"',
      '"data"."is_deal_purchase"',
      '"data"."is_deal_sale"',
      `(
        SELECT
          COALESCE(
            json_build_object(
              'id', "affected_wallet"."id",
              'address', "affected_wallet"."address",
              'type', "affected_wallet"."type"
            ),
            '{}'
          )
        ) AS "user_wallet"`,
      `(
        SELECT
          COALESCE(
            json_build_object(
              'id', "currency"."id",
              'name', "currency"."name",
              'address', "currency"."address"
            ),
            '{}'
          )
        ) AS "currency"`,
      `(
        SELECT
          COALESCE(
            json_build_object(
              'id', "user_deal_payment"."id",
              'deal_type', "user_deal_payment"."deal_type",
              'deal_amount', "user_deal_payment"."deal_amount",
              'transaction_hash', "user_deal_payment"."transaction_hash"
            ),
            '{}'
          )
        ) AS "user_deal_payment"`,
    ])

    return this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
