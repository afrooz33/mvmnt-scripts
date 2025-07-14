import { In } from 'typeorm'
import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { ICsvDonationSourceDonor, QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { DonationSourceDonorListDto } from '@app/src/nonprofit/donation-projects/dto'

export default async function (
  id: string,
  query: DonationSourceDonorListDto,
  userId: string,
  donationSourceId: string,
  isExport = false,
): Promise<PaginateRO> {
  try {
    await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: {
              id: userId,
            },
            status: In([Status.ENDED, Status.TO_BE_CANCELLED, Status.PUBLISHED]),
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.DONATION_PROJECT_NOT_FOUND,
    })

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('donation_project', id)
      .addRelation('user')
      .addRelation('user.profile')
      .addRelation('profile.profile_images')
      .addRelation('user_deal_item_payment')
      .addRelation('user_donation_payment')
      .useQuery(this.donationRepository)
      .create()

    results.condition.andWhere(
      `"data"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
    )

    results.condition.andWhere(
      '("user_deal_item_payment"."dealId" = :donationSourceId OR "user_donation_payment"."reference_id" = :donationSourceId)',
      { donationSourceId },
    )

    if (query.amount?.start) {
      results.condition.andWhere('data.amount >= :start', {
        start: query.amount.start,
      })
    }

    if (query.amount?.end) {
      results.condition.andWhere('data.amount <= :end', {
        end: query.amount.end,
      })
    }

    if (query.keyword) {
      results.condition.andWhere(`"donor"."display_name"::text ILIKE :search`, {
        search: `%${query.keyword}%`,
      })

      results.condition.orWhere(`"donor"."username"::text ILIKE :search`, {
        search: `%${query.keyword}%`,
      })
    }

    if (query?.donation_type) {
      results.condition.andWhere(`"data"."reason" IN (:...donationTypes)`, {
        donationTypes: query.donation_type,
      })
    }

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      if (!data.length) {
        return null
      }

      const csvData: ICsvDonationSourceDonor[] = data.map(this.toCSVDonationSourceDonor)

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return await this.customPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
