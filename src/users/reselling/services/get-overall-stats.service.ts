import { ResellingEventType } from '@app/src/users/reselling/enums'

export default async function (
  userId: string,
  dealId?: string,
  startDate?: Date,
  endDate?: Date,
  token?: string,
): Promise<any> {
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

  const overallStats = {
    views: 0,
    purchases: 0,
    totalAmount: 0,
    conversionRate: 0,
  }

  for (const link of resellingLinks) {
    const resellingLinkId = link.id

    const query = this.resellingEventRepository
      .createQueryBuilder('event')
      .select('event.type', 'eventType')
      .addSelect('COUNT(event.id)', 'count')
      .addSelect('SUM(event.purchase_amount)', 'totalAmount')
      .where('event.reselling_link = :resellingLinkId', { resellingLinkId })
      .andWhere('event.reseller_banned = :resellerBanned', { resellerBanned: false })
      .groupBy('event.type')

    if (startDate) {
      query.andWhere('event.created >= :startDate', { startDate })
    }

    if (endDate) {
      query.andWhere('event.created <= :endDate', { endDate })
    }

    const stats = await query.getRawMany()

    stats.forEach((stat) => {
      switch (stat.eventType) {
        case ResellingEventType.VIEW:
          overallStats.views += Number.parseInt(stat.count, 10)
          break
        case ResellingEventType.PURCHASE:
          overallStats.purchases += Number.parseInt(stat.count, 10)
          overallStats.totalAmount += Number.parseFloat(stat.totalAmount) || 0
          break
      }
    })
  }

  overallStats.conversionRate =
    overallStats.views > 0 ? (overallStats.purchases / overallStats.views) * 100 : 0

  return overallStats
}
