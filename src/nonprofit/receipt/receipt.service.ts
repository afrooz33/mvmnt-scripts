import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { PaginateRO } from '@app/src/shared/dto'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { PaginationBuilder } from '@app/src/shared/helpers/Pagination.builder'
import { CheckNonprofitDonationQuery, GetProfileImageQuery } from '@app/src/shared/sql'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { UserService } from '@app/src/users/user/user.service'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { RecurringDonationSettingsEntity } from '@app/src/recurring-donations/entities/recurring-donation-settings.entity'
import { QueryDto } from './dto'
import {
  showService,
  userProfileService,
  userDonationsService,
  recurringDonationService,
  userDonationCsvResponseService,
} from './services'

export class ReceiptService extends MyService<UserDonationsEntity> {
  constructor(
    @InjectRepository(UserDonationsEntity)
    private readonly donationsRepository: Repository<UserDonationsEntity>,
    @InjectRepository(RecurringDonationSettingsEntity)
    private readonly recurringDonationsRepository: Repository<RecurringDonationSettingsEntity>,
    private readonly userService: UserService,
  ) {
    super(donationsRepository, 'nonprofit/receipts')
  }

  private receiptResponse(items) {
    return items
  }

  async prepareQuery(
    results: QueryBuilderDataInterface,
    userId: string,
    query: QueryDto,
    isGroupBy = true,
  ) {
    let year_query = ''

    if (query?.donation_year) {
      year_query = ` AND EXTRACT(YEAR FROM "donation"."created") = ${query.donation_year}`
    }

    const total_donation = `(SELECT
        COALESCE(SUM("donation"."amount"), 0)
      FROM
        "user_donations" "donation"
      WHERE "donation"."userId" = "user"."id"
        AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${
          DONATION_STATUS.SETTLED
        }')${year_query} AND ${CheckNonprofitDonationQuery('donation', userId)})`

    const no_donations = `(SELECT
        COALESCE(COUNT("donation"."id"), 0)
      FROM
        "user_donations" "donation"
      WHERE "donation"."userId" = "user"."id"
        AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${
          DONATION_STATUS.SETTLED
        }')${year_query} AND ${CheckNonprofitDonationQuery('donation', userId)})`

    results.condition.select([
      'user.id as user_id',
      'user.username as username',
      'user.account_type as account_type',
      'user.display_name as display_name',
      'profile.social_accounts as social_accounts',
    ])

    results.condition.addSelect(total_donation, 'total_donation')
    results.condition.addSelect(no_donations, 'no_donations')
    results.condition.addSelect(GetProfileImageQuery(), 'profile_images')

    results.condition.andWhere(CheckNonprofitDonationQuery('data', userId))

    results.condition.orderBy({
      total_donation: 'DESC',
    })

    if (query?.keyword) {
      results.condition.andWhere(
        `("user"."username" ILIKE '%${query.keyword}%'
          OR "user"."display_name" ILIKE '%${query.keyword}%')`,
      )
    }

    if (query?.donation_year) {
      results.condition.andWhere(`EXTRACT(YEAR FROM "data"."created") = ${query.donation_year}`)
    }

    if (query.total_donations?.start) {
      results.condition.andWhere(`${total_donation} >= :start`, {
        start: query.total_donations?.start,
      })
    }

    if (query.total_donations?.end) {
      results.condition.andWhere(`${total_donation} <= :end`, {
        end: query.total_donations?.end,
      })
    }

    if (isGroupBy) {
      results.condition.groupBy('user.id, profile.id')
    }

    return results
  }

  async receiptPaginate(data: QueryBuilderDataInterface): Promise<PaginateRO> {
    return new PaginationBuilder(this.donationsRepository, true)
      .setOption({
        ...data.pagination,
        route: this.paginationLinks,
      })
      .setCondition(data.condition)
      .setType(data.isQueryType)
      .create((response) => response.map(this.receiptResponse))
  }

  show = showService.bind(this)
  userProfile = userProfileService.bind(this)
  userDonations = userDonationsService.bind(this)
  recurringDonation = recurringDonationService.bind(this)
  userDonationCsvResponse = userDonationCsvResponseService.bind(this)
}
