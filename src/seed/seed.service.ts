import { EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { faker } from '@faker-js/faker/locale/ja'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Status } from '@app/src/shared/enums'
import { AccountType } from '@app/src/shared/auth/enums'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { DealCategoryType } from '@app/src/admin/deals/category/enums'
import {
  geoSeeder,
  dealSeeder,
  userSeeder,
  adminSeeder,
  bannerSeeder,
  guidesSeeder,
  userBidSeeder,
  homePageSeeder,
  nonprofitSeeder,
  dealLikeSeeder,
  userStarSeeder,
  languageSeeder,
  dealShareSeeder,
  staticTagsSeeder,
  dealReviewSeeder,
  dealOptionSeeder,
  notificationSeeder,
  userAddressSeeder,
  staticUsersSeeder,
  userFollowerSeeder,
  staticAdminSeeder,
  nonprofitNewsSeeder,
  raffleWinnersSeeder,
  dealTemplateSeeder,
  businessInfoSeeder,
  staticBrandsSeeder,
  existingUserSeeder,
  userIdentitySeeder,
  dealQuantitySeeder,
  resellingDataSeeder,
  nonprofitShareSeeder,
  staticNonprofitSeeder,
  staticCategorySeeder,
  regionSettingsSeeder,
  dealUpdateNoteSeeder,
  shippingMethodSeeder,
  staticPostcodeSeeder,
  donationProjectSeeder,
  re2UserAndSourceSeeder,
  notificationSettingSeeder,
  userRecentlyViewedSeeder,
  nonprofitBankAccountSeeder,
  donationProjectShareSeeder,
} from './services'

@Injectable()
export class SeedService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  getBrands = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT "id" FROM "brands" WHERE "status" = '${Status.ENABLED}';`,
    )
  }

  getLanguages = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT "id" FROM "languages" WHERE "status" = '${Status.ACTIVE}';`,
    )
  }

  getLanguagesByCode = async (code: string): Promise<ISeederEntity[]> => {
    const language = await this.entityManager.query(
      `SELECT "id" FROM "languages" WHERE "status" = '${Status.ACTIVE}' AND "code" = '${code}' LIMIT 1;`,
    )

    if (!language.length) {
      throw new Error(`Language code ${code} not found`)
    }

    return language[0]
  }

  getCategory = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT "id" FROM "deal_categories" WHERE "status" = '${Status.ENABLED}';`,
    )
  }

  getSmallCategory = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT "id" FROM "deal_categories" WHERE "status" = $1 AND "type" = $2;`,
      [Status.ENABLED, DealCategoryType.SMALL],
    )
  }

  getShippingMethods = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT "id" FROM "shipping_methods" WHERE "status" = '${Status.ENABLED}';`,
    )
  }

  getUsers = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT "id" FROM "users" WHERE "account_status" = '${Status.ENABLED}';`,
    )
  }

  getBusinessUsers = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(`SELECT
        "id",
        "account_type"
      FROM
        "users" WHERE "account_status" = '${Status.ENABLED}' AND "account_type" IN (
          '${AccountType.BUSINESS_COMPANY}',
          '${AccountType.BUSINESS_SOLE_PROPRIETOR}');`)
  }

  getFakerImage = (section, is_featured = false): any => {
    const dimensions = {
      width: 1024,
      height: 1024,
    }

    return {
      url: faker.image.url(dimensions),
      filename: faker.system.fileName(),
      is_featured,
      section,
    }
  }

  getDealOption = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(`SELECT "id" FROM "deal_options";`)
  }

  getDealOptionByType = async (type: string): Promise<ISeederEntity[]> => {
    const option = await this.entityManager.query(
      `SELECT "id" FROM "deal_options" WHERE "type" = '${type}';`,
    )

    if (!option.length) {
      throw new Error(`Deal option type ${type} not found`)
    }

    return option[0]
  }

  getTags = async (limit = 1): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(`SELECT
        "id"
      FROM
        "tags"
      WHERE
        "status" = '${Status.ACTIVE}'
        ORDER BY RANDOM() LIMIT ${limit};`)
  }

  getNonprofits = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT "id" FROM "nonprofit_users" WHERE "account_status" = '${Status.ACTIVE}';`,
    )
  }

  getDonationProjects = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT "id" FROM "donation_projects" WHERE "status" = '${Status.PUBLISHED}';`,
    )
  }

  getCountries = async (code: string = ''): Promise<ISeederEntity[]> => {
    if (code) {
      return await this.entityManager.query(
        `SELECT "id" FROM "countries" WHERE "code" = '${code}';`,
      )
    }

    return await this.entityManager.query(`SELECT "id" FROM "countries";`)
  }

  getPostcodes = async (code: string = ''): Promise<ISeederEntity[]> => {
    if (code) {
      return await this.entityManager.query(
        `SELECT "id" FROM "postcodes" WHERE "postcode" = '${code}';`,
      )
    }

    return await this.entityManager.query(`SELECT "id" FROM "postcodes";`)
  }

  getUserProfile = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT "id" FROM "user_profiles" WHERE "verification_status" = '${Status.VERIFIED}';`,
    )
  }

  getDeals = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT "id", "userId", "name" FROM "deals" WHERE "status" = '${DealStatus.ON_DEAL}';`,
    )
  }

  getDealsByType = async (type: DealType): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT "id", "userId", "name", "starting_price" FROM "deals" WHERE "status" = '${DealStatus.ON_DEAL}' AND "deal_type" = '${type}';`,
    )
  }

  getDealWithUserById = async (id: string): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT
        "deals"."id",
        "deals"."name",
        "users"."username",
        "users"."display_name"
      FROM
        "deals"
      LEFT JOIN
        "users" ON "users"."id" = "deals"."userId"
      WHERE "deals"."id" = '${id}';`,
    )
  }

  getDealByUserIdAndType = async (id: string, type: DealType): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT "id", "name" FROM "deals" WHERE "userId" = '${id}' AND "deal_type" = '${type}' AND "status" IN ('${DealStatus.ON_DEAL}', '${DealStatus.ENDED}');`,
    )
  }

  getAuctionDeals = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT "id", "userId" FROM "deals" WHERE "status" = '${DealStatus.ON_DEAL}' AND "deal_type" = '${DealType.AUCTION}';`,
    )
  }

  getDealVariants = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(`SELECT * FROM "deal_variants";`)
  }

  getDealVariantByDeal = async (dealId: string): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT * FROM "deal_variants" WHERE "dealId" = '${dealId}';`,
    )
  }

  getRafflePrize = async (dealId: string): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT
        *
      FROM
        "deal_raffle_prizes" "prize"
      WHERE
        "prize"."rafflesId" IN (
          SELECT
            "raffle"."id"
          FROM
            "deals"
          LEFT JOIN "deal_raffles" "raffle" ON "raffle"."dealId" = "deals"."id"
          WHERE
            "deals"."id" = '${dealId}'
        );`,
    )
  }

  getRafflePurchase = async (dealId: string): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT * FROM "user_deal_raffle_purchases" WHERE "dealId" = '${dealId}';`,
    )
  }

  getRE2Fundraisers = async (): Promise<ISeederEntity[]> => {
    return await this.entityManager.query(
      `SELECT "id" FROM "re2_fundraisers" WHERE "status" = '${Status.ENABLED}';`,
    )
  }

  seedGeo = geoSeeder.bind(this)
  seedUser = userSeeder.bind(this)
  seedDeal = dealSeeder.bind(this)
  seedGuides = guidesSeeder.bind(this)
  seedBanner = bannerSeeder.bind(this)
  seedUserBid = userBidSeeder.bind(this)
  seedAdminUser = adminSeeder.bind(this)
  seedDealLike = dealLikeSeeder.bind(this)
  seedNonprofit = nonprofitSeeder.bind(this)
  seedUserStar = userStarSeeder.bind(this)
  seedLanguage = languageSeeder.bind(this)
  seedHomePages = homePageSeeder.bind(this)
  seedDealShare = dealShareSeeder.bind(this)
  seedDealReview = dealReviewSeeder.bind(this)
  seedDealOption = dealOptionSeeder.bind(this)
  seedStaticTags = staticTagsSeeder.bind(this)
  seedNotification = notificationSeeder.bind(this)
  seedUserAddress = userAddressSeeder.bind(this)
  seedStaticUsers = staticUsersSeeder.bind(this)
  seedExistingUser = existingUserSeeder.bind(this)
  seedStaticBrands = staticBrandsSeeder.bind(this)
  seedUserFollower = userFollowerSeeder.bind(this)
  seedNonprofitNews = nonprofitNewsSeeder.bind(this)
  seedUserIdentity = userIdentitySeeder.bind(this)
  seedDealTemplate = dealTemplateSeeder.bind(this)
  seedBusinessInfo = businessInfoSeeder.bind(this)
  seedDealQuantity = dealQuantitySeeder.bind(this)
  seedRaffleWinners = raffleWinnersSeeder.bind(this)
  seedResellingData = resellingDataSeeder.bind(this)
  seedStaticAdminUser = staticAdminSeeder.bind(this)
  seedNonprofitShare = nonprofitShareSeeder.bind(this)
  seedStaticNonprofit = staticNonprofitSeeder.bind(this)
  seedDealUpdateNote = dealUpdateNoteSeeder.bind(this)
  seedRegionSettings = regionSettingsSeeder.bind(this)
  seedShippingMethod = shippingMethodSeeder.bind(this)
  seedStaticPostcodes = staticPostcodeSeeder.bind(this)
  seedStaticCategories = staticCategorySeeder.bind(this)
  seedDonationProject = donationProjectSeeder.bind(this)
  seedRe2UserAndSource = re2UserAndSourceSeeder.bind(this)
  seedNotificationSetting = notificationSettingSeeder.bind(this)
  seedUserRecentlyViewed = userRecentlyViewedSeeder.bind(this)
  seedNonprofitBankAccount = nonprofitBankAccountSeeder.bind(this)
  seedDonationProjectShare = donationProjectShareSeeder.bind(this)

  private getArgsByType(arg: string): Record<string, string> {
    const result = {}
    const args = arg.split(':')

    args.forEach((arg) => {
      const [key, value] = arg.split('=') as [string, string]

      if (key && value) {
        result[key] = value
      }
    })

    return result
  }

  private getArgs() {
    const allowedArgs = [
      'flush',
      'users',
      'deals',
      'admins',
      'guides',
      'banners',
      'fix-users',
      'user-bids',
      'nonprofits',
      'static-geo',
      'home-pages',
      'deal-likes',
      'user-stars',
      'deal-review',
      'static-tags',
      'deal-shares',
      'notifications',
      'static-users',
      'deal-quantity',
      'static-admins',
      'static-brands',
      'nonprofit-news',
      'raffle-winners',
      'business-infos',
      'deal-templates',
      'user-addresses',
      'user-followers',
      'reselling-data',
      'static-nonprofit',
      'user-identities',
      'region-settings',
      'nonprofit-shares',
      'activity-reports',
      'shipping-methods',
      'static-postcodes',
      'deal-update-notes',
      'static-categories',
      'donation-projects',
      're2-user-and-source',
      'notification-settings',
      'user-recently-viewed',
      'nonprofit-bank-accounts',
      'donation-project-shares',
    ]

    const argument = {}
    let last: string | undefined

    const specialArgs = {
      'deal-quantity': true,
      'fix-users': true,
      notifications: true,
      'region-settings': true,
      'reselling-data': true,
    }

    process.argv.forEach((arg, index) => {
      if (index <= 1) return

      if (arg.includes(':')) {
        const [key, value] = arg.split(':')

        if (specialArgs[key]) {
          argument[key] = this.getArgsByType(arg)
        } else if (allowedArgs.includes(key)) {
          argument[key] = Number.parseInt(value, 10)
          last = key
        } else {
          throw new Error(`Invalid argument ${key}`)
        }
      } else if (last) {
        argument[last] = Number.parseInt(arg)
      } else if (allowedArgs.includes(arg)) {
        argument[arg] = 1
      } else {
        throw new Error(`Invalid argument ${arg}`)
      }
    })

    return argument
  }

  async seedAll(): Promise<void> {
    const seeders: any = await this.getArgs()

    if (seeders['flush']) {
      console.log('Flushing...')

      await this.entityManager.query(`TRUNCATE TABLE "coupons" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "countries" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "brands" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "brand_translations" CASCADE;`)

      await this.entityManager.query(`TRUNCATE TABLE "banners" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_categories" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "admin_profiles" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_category_translations" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_option_values" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "admins" CASCADE;`)

      await this.entityManager.query(`TRUNCATE TABLE "bank_accounts" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "activity_reports" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "coupon_search_conditions" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_shipping_fee_templates" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_shipping_fees" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_raffle_prizes" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_reports_images_images" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_purchases" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_reports" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_raffles" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_templates" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "help_articles" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_variants" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deals" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "help_article_translations" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "donation_projects" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "donation_projects_images_images" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "donation_projects_tags_tags" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deals_options_deal_options" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "guides" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deals_images_images" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_variants_images_images" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_update_notes" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "donation_project_history" CASCADE;`)
      await this.entityManager.query(
        `TRUNCATE TABLE "deal_variants_option_values_deal_option_values" CASCADE;`,
      )
      await this.entityManager.query(`TRUNCATE TABLE "donations" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "nonprofit_news" CASCADE;`)

      await this.entityManager.query(`TRUNCATE TABLE "images" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "help_categories" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "images_deals_deals" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "languages_tags_tag_translations" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "help_category_translations" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "homepages" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "login_activity" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "homepage_contents" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "nonprofit_bank_accounts" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "system_fees" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "nonprofit_users" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "shipping_methods" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "notifications" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "notification_settings" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "re2_users" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "shipping_method_translations" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_deals_shares" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "task_scheduled" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_nonprofits_shares" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_deals_likes" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_donation_projects_shares" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_bank_accounts" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_addressess" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_contact" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "tags" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_business_shop_info" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_deal_bids" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "tag_translations" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_deal_shopping_variant_options" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_deal_buynow_cart" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_deal_shopping_cart_items" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_deal_buynow_cart_items" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_deal_item_payment" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_deal_payment" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_identity_documents" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "users_followers" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_recently_viewed_deals" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "users_email_change" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_deal_raffle_purchases" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_deal_raffle_winner" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "homepage_translations" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "guide_translations" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "coupon_translations" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "deal_raffle_prizes_images_images" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "users" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "re2_profiles" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "nonprofit_profiles" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "nonprofit_profiles_tags_tags" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_profiles" CASCADE;`)
      await this.entityManager.query(`TRUNCATE TABLE "user_deal_review" CASCADE;`)

      console.log('Flushing completed.')
      return
    }

    /**
     * Seed
     * languages
     * deal options as default
     */
    await this.seedLanguage()
    await this.seedDealOption()

    if (seeders['static-postcodes']) {
      console.log('Seeding static postcodes...')

      await this.seedStaticPostcodes()

      console.log('Seeding static postcodes completed.')
      return
    }

    if (seeders['guides']) {
      console.log('Seeding guides...')

      await this.seedGuides()

      console.log('Seeding guides completed.')
      return
    }

    if (seeders['region-settings']) {
      console.log('Seeding region settings...')

      await this.seedRegionSettings(seeders['region-settings'])

      console.log('Seeding region settings completed.')
      return
    }

    if (seeders['static-geo']) {
      console.log('Seeding static geo...')

      await this.seedGeo()

      console.log('Seeding static geo completed.')
      return
    }

    if (seeders['static-tags']) {
      console.log('Seeding static tags...')

      await this.seedStaticTags()

      console.log('Seeding static tags completed.')
      return
    }

    if (seeders['static-categories']) {
      console.log('Seeding static categories...')

      await this.seedStaticCategories()

      console.log('Seeding static categories completed.')
      return
    }

    if (seeders['static-users']) {
      console.log('Seeding static users...')

      await this.seedStaticUsers()

      console.log('Seeding static users completed.')
      return
    }

    if (seeders['reselling-data']) {
      console.log('Seeding reselling data...')

      await this.seedResellingData(seeders['reselling-data'])

      console.log('Seeding reselling data completed.')
      return
    }

    if (seeders['static-nonprofit']) {
      console.log('Seeding static nonprofits...')

      await this.seedStaticNonprofit()

      console.log('Seeding static nonprofits completed.')
      return
    }

    if (seeders['static-admins']) {
      console.log('Seeding static admins...')

      await this.seedStaticAdminUser()

      console.log('Seeding static admins completed.')
      return
    }

    if (seeders['static-brands']) {
      console.log('Seeding static brands...')

      await this.seedStaticBrands()

      console.log('Seeding static brands completed.')
      return
    }

    if (seeders['raffle-winners']) {
      console.log('Seeding raffle winners...')

      await this.seedRaffleWinners(seeders['raffle-winners'])

      console.log('Seeding raffle winners completed.')
      return
    }

    if (seeders['re2-user-and-source']) {
      console.log('Seeding re2 user and source...')

      await this.seedRe2UserAndSource(seeders['re2-user-and-source'])

      console.log('Seeding re2 user and source completed.')
      return
    }

    console.log('Seeding...')

    if (seeders['fix-users']) {
      console.log('Fix existing users...')

      await this.seedExistingUser(seeders['fix-users'])

      console.log('Fix existing users completed.')

      return
    }

    if (seeders['deal-quantity']) {
      console.log('Seeding deal quantity...')

      await this.seedDealQuantity(seeders['deal-quantity'])

      console.log('Seeding deal quantity completed.')

      return
    }

    if (seeders['user-stars']) {
      await this.seedUserStar(seeders['user-stars'])
    }

    if (seeders['banners']) {
      await this.seedBanner(seeders.banners)
    }

    if (seeders['admins']) {
      await this.seedAdminUser(seeders.admins)
    }

    if (seeders['users']) {
      await this.seedUser(seeders.users)
    }

    if (seeders['business-infos']) {
      await this.seedBusinessInfo(seeders['business-infos'])
    }

    if (seeders['user-addresses']) {
      await this.seedUserAddress(seeders['user-addresses'])
    }

    if (seeders['user-followers']) {
      await this.seedUserFollower(seeders['user-followers'])
    }

    if (seeders['user-identities']) {
      await this.seedUserIdentity(seeders['user-identities'])
    }

    if (seeders['nonprofits']) {
      await this.seedNonprofit(seeders.nonprofits)
    }

    if (seeders['donation-projects']) {
      await this.seedDonationProject(seeders['donation-projects'])
    }

    if (seeders['shipping-methods']) {
      await this.seedShippingMethod(seeders['shipping-methods'])
    }

    if (seeders['deals']) {
      await this.seedDeal(seeders.deals)
    }

    if (seeders['deal-templates']) {
      await this.seedDealTemplate(seeders['deal-templates'])
    }

    if (seeders['user-bids']) {
      await this.seedUserBid(seeders['user-bids'])
    }

    if (seeders['deal-likes']) {
      await this.seedDealLike(seeders['deal-likes'])
    }

    if (seeders['deal-shares']) {
      await this.seedDealShare(seeders['deal-shares'])
    }

    if (seeders['nonprofit-news']) {
      await this.seedNonprofitNews(seeders['nonprofit-news'])
    }

    if (seeders['nonprofit-shares']) {
      await this.seedNonprofitShare(seeders['nonprofit-shares'])
    }

    if (seeders['nonprofit-bank-accounts']) {
      await this.seedNonprofitBankAccount(seeders['nonprofit-bank-accounts'])
    }

    if (seeders['user-recently-viewed']) {
      await this.seedUserRecentlyViewed(seeders['user-recently-viewed'])
    }

    if (seeders['donation-project-shares']) {
      await this.seedDonationProjectShare(seeders['donation-project-shares'])
    }

    if (seeders['deal-update-notes']) {
      await this.seedDealUpdateNote(seeders['deal-update-notes'])
    }

    if (seeders['home-pages']) {
      await this.seedHomePages(seeders['home-pages'])
    }

    if (seeders['deal-review']) {
      await this.seedDealReview(seeders['deal-review'])
    }

    if (seeders['notifications']) {
      await this.seedNotification(seeders['notifications'])
    }

    if (seeders['notification-settings']) {
      await this.seedNotificationSetting(seeders['notification-settings'])
    }

    console.log('Seeding completed.')
  }
}
