import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ResellingEventType } from '@app/src/users/reselling/enums'

export default async function (
  userId: string,
  dealId?: string,
  startDate?: Date,
  endDate?: Date,
  token?: string,
): Promise<{ [resellingLinkId: string]: number }> {
  try {
    const where = {
      user: {
        id: userId,
      },
      ...(dealId ? { deal: { id: dealId } } : {}),
    }

    if (token) {
      where['unique_token'] = token
    }

    const resellingLinks = await this.resellingLinkRepository.find({ where })

    if (!resellingLinks.length) {
      return {}
    }

    const resellingLinkIds = resellingLinks.map((link) => link.id)

    const query = this.resellingEventRepository
      .createQueryBuilder('event')
      .select('event.reselling_link', 'resellingLinkId')
      .addSelect(`SUM(CASE WHEN event.type = :viewType THEN 1 ELSE 0 END)`, 'viewsCount')
      .addSelect(`SUM(CASE WHEN event.type = :purchaseType THEN 1 ELSE 0 END)`, 'purchasesCount')
      .where('event.reselling_link IN (:...resellingLinkIds)', {
        resellingLinkIds,
      })
      .where('event.reseller_banned = :resellerBanned', { resellerBanned: false })
      .setParameters({
        viewType: ResellingEventType.VIEW,
        purchaseType: ResellingEventType.PURCHASE,
      })
      .groupBy('event.reselling_link')

    if (startDate) {
      query.andWhere('event.created >= :startDate', { startDate })
    }

    if (endDate) {
      query.andWhere('event.created <= :endDate', { endDate })
    }

    const result = await query.getRawMany()

    const conversionRates = {}

    for (const row of result) {
      const viewsCount = parseInt(row.viewsCount, 10)
      const purchasesCount = parseInt(row.purchasesCount, 10)
      conversionRates[row.resellingLinkId] =
        viewsCount === 0 ? 0 : (purchasesCount / viewsCount) * 100
    }

    return conversionRates
  } catch (error) {
    return HandleErrors(error)
  }
}
