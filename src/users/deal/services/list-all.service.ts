import { In } from 'typeorm'
import { PaginateRO } from '@app/src/shared/dto'
import { Query } from '@app/src/shared/enums'
import { ListQueryDto } from '@app/src/users/deal/dto'
import { UserAccountType } from '@app/src/users/user/enums'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import {
  GetDealPriceQuery,
  GetTotalBidsQuery,
  GetDonationAmountQuery,
  GetDealFirstImageQuery,
  GetRaffleTotalPrizesQuery,
  GetDealQuantityQuery,
} from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { DealCategoryType } from '@app/src/admin/deals/category/enums'

/**
 * Retrieves the subcategories based on the given type.
 * @param categoryId the id of the category
 * @param type the type of the category
 * @returns an array of subcategory ids
 */
async function getSubcategoriesByType(
  categoryIds: string[],
  type: string,
  dealCatalogService: any,
) {
  switch (type) {
    case DealCategoryType.BIG: {
      const middleCategories = await dealCatalogService.dealCategoryRepository.find({
        where: { parent: In(categoryIds), type: DealCategoryType.MIDDLE },
      })

      const middleCategoryIds = middleCategories.map((cat) => cat.id)

      const smallCategories = await dealCatalogService.dealCategoryRepository.find({
        where: { parent: In(middleCategoryIds), type: DealCategoryType.SMALL },
      })

      return [...middleCategoryIds, ...smallCategories.map((cat) => cat.id)]
    }
    case DealCategoryType.MIDDLE: {
      const smallCategories = await dealCatalogService.dealCategoryRepository.find({
        where: { parent: In(categoryIds), type: DealCategoryType.SMALL },
      })

      return smallCategories.map((cat) => cat.id)
    }
    case DealCategoryType.SMALL: {
      return categoryIds
    }

    default:
      return []
  }
}

export default async function (query: ListQueryDto): Promise<PaginateRO> {
  try {
    let priceSorting = false
    let categoryIds: string[] = []

    const filterDonationNonprofit = query?.includeIds?.['donation_nonprofit']
    const sellerUsername = `(SELECT "users"."username" FROM "users" WHERE "users"."id" = "data"."userId")`
    const sellerIsVerified = `(SELECT "users"."is_verified" FROM "users" WHERE "users"."id" = "data"."userId")`
    const sellerAccountType = `(SELECT "users"."account_type" FROM "users" WHERE "users"."id" = "data"."userId")`

    if (query?.includeIds?.[Query.CATEGORY]?.length > 0) {
      const inputCategoryIds = query.includeIds[Query.CATEGORY]

      delete query.includeIds[Query.CATEGORY]

      const categories = await this.dealCatalogService.dealCategoryRepository.find({
        where: { id: In(inputCategoryIds) },
      })

      for (const category of categories) {
        const subCategoryIds = await getSubcategoriesByType(
          [category.id],
          category.type,
          this.dealCatalogService,
        )
        categoryIds = [...categoryIds, ...subCategoryIds]
      }
    }

    categoryIds = [...new Set(categoryIds)]

    if (filterDonationNonprofit?.length) {
      delete query.includeIds['donation_nonprofit']
    }

    if (query?.order_by && query?.order_by === 'price') {
      priceSorting = true
      delete query.order_by
    }

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.dealRepository)
      .addRelation(Query.BRAND)
      .addRelation(Query.CATEGORY)
      .addRelation(Query.DONATION_NONPROFIT)
      .addRelation(`${Query.DONATION_NONPROFIT}.${Query.PROFILE}`)
      .addRelation(Query.DONATION_PROJECT)
      .create()

    if (!query?.filter?.status) {
      results.condition.andWhere(
        `data.status IN ('${DealStatus.ON_DEAL}', '${DealStatus.ENDED}', '${DealStatus.SCHEDULED}')`,
      )
    }

    results.condition.andWhere('"data"."deal_access_date" <= CURRENT_DATE')

    results.condition.select([
      'data.id as id',
      'data.name as name',
      'data.status as status',
      'data.end_date as end_date',
      'data.deal_type as deal_type',
      'data.start_date as start_date',
      'data.donation_type as donation_type',
      'data.item_condition as item_condition',
      'data.is_one_of_kind as is_one_of_kind',
      'data.donation_amount as donation_amount',
      'data.purchase_availability as purchase_availability',
      'data.deal_availability as deal_availability',
      'data.deal_access_date as deal_access_date',
      `${GetDealPriceQuery('"data"')} AS "price"`,
      `${GetDealFirstImageQuery('"data"."deal_type"', '"data"."id"')}`,
      `CASE
        WHEN data.deal_type = '${DealType.AUCTION}' THEN (${GetTotalBidsQuery('"data"')})
        ELSE '0' END AS "total_bids"`,
      `CASE
        WHEN data.deal_type = '${DealType.RAFFLE}' THEN (${GetRaffleTotalPrizesQuery('"data"')})
        ELSE '0' END AS "total_prizes"`,
      `${GetDealQuantityQuery('"data"."id" = "deals"."id"')} AS "remaining_quantity"`,
      `data."userId" as "seller_id"`,
      `${sellerUsername} as "seller_username"`,
      `${sellerAccountType} as "seller_account_type"`,
      `${sellerIsVerified} as "seller_is_verified"`,
      `(SELECT
        "images"."url" FROM "images" WHERE "images"."id" = (SELECT "user_profiles"."profileImagesId" FROM "user_profiles" WHERE "user_profiles"."userId" = "data"."userId")) as "seller_profile_image"`,
      `${GetDonationAmountQuery('"data"')} AS "donation"`,
      `(SELECT
        COUNT(*)::int FROM "deal_variants" WHERE "dealId" = "data"."id") AS "variants_count"`,
    ])

    if (query?.keyword) {
      results.condition.andWhere(
        `(
          data.name ILIKE '%${query.keyword}%' OR
          ${sellerUsername} ILIKE '%${query.keyword}%' OR
          profile.first_name ILIKE '%${query.keyword}%' OR
          profile.last_name ILIKE '%${query.keyword}%' OR
          profile.foundation_name ILIKE '%${query.keyword}%' OR
          donation_project.name ILIKE '%${query.keyword}%'
        )`,
      )
    }

    if (query?.price?.start) {
      results.condition.andWhere(`${GetDealPriceQuery('"data"')} >= ${query.price.start}`)
    }

    if (query?.price?.end) {
      results.condition.andWhere(`${GetDealPriceQuery('"data"')} <= ${query.price.end}`)
    }

    if (query?.donation?.start) {
      results.condition.andWhere(`(${GetDonationAmountQuery('"data"')}) >= ${query.donation.start}`)
    }

    if (query?.donation?.end) {
      results.condition.andWhere(`(${GetDonationAmountQuery('"data"')}) <= ${query.donation.end}`)
    }

    const account_type = []

    if (query?.user_account_type?.indexOf('business') > -1) {
      account_type.push(UserAccountType.BUSINESS_COMPANY)
      account_type.push(UserAccountType.BUSINESS_SOLE_PROPRIETOR)
    }

    if (query?.user_account_type?.indexOf('personal') > -1) {
      account_type.push(UserAccountType.INDIVIDUAL_PERSONAL)
    }

    if (query?.user_account_type?.indexOf('influencer') > -1) {
      account_type.push(UserAccountType.INDIVIDUAL_INFLUENCER)
    }

    if (query?.item_type?.indexOf('official') > -1) {
      account_type.push(UserAccountType.BUSINESS_COMPANY)
      account_type.push(UserAccountType.BUSINESS_SOLE_PROPRIETOR)
    }

    if (account_type.length) {
      results.condition.andWhere(`(${sellerAccountType}) IN (:...account_type)`, {
        account_type,
      })
    }

    if (filterDonationNonprofit?.length) {
      const nonprofitParam = filterDonationNonprofit.map((id) => `'${id}'`).join(', ')

      results.condition.andWhere(
        `("data"."donationNonprofitId" IN (${nonprofitParam}) OR "data"."donationProjectId" IN (
          SELECT "donation_projects"."id" FROM "donation_projects" WHERE "donation_projects"."userId" IN (${nonprofitParam}) AND "donation_projects"."status" IN ('${DonationProjectStatus.PUBLISHED}', '${DonationProjectStatus.ENDED}', '${DonationProjectStatus.TO_BE_CANCELLED}')
        ))`,
      )
    }

    if (categoryIds?.length) {
      results.condition.andWhere(`"data"."categoryId" IN (:...category_ids)`, {
        category_ids: categoryIds,
      })
    }

    if (priceSorting) {
      results.condition.orderBy(`${GetDealPriceQuery('"data"')}`, query?.order_direction)
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
