import { DateTime } from 'luxon'
import { Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { ResellingEventType } from '@app/src/users/reselling/enums'
import { SellerMonthPaidHistoryDto } from '@app/src/users/reselling/dto'

function generateDaysInMonth(year: number, month: number) {
  year = parseInt(year as any, 10)
  month = parseInt(month as any, 10)

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return []
  }

  const days = []
  const startDate = DateTime.local(year, month, 1)
  const endDate = startDate.endOf('month')

  let current = startDate

  while (current <= endDate) {
    days.push(current.toISODate())
    current = current.plus({ days: 1 })
  }

  return days
}

export default async function (query: SellerMonthPaidHistoryDto, userId: string): Promise<unknown> {
  try {
    const { month, year, by_resellers } = query

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.resellingEventRepository)
      .addRelation(Query.REWARD)
      .addRelation(Query.RESELLING_LINK)
      .addRelation(Query.RESELLING_LINK_DEAL)
      .addFilter('reseller_banned', false)
      .create()

    if (!by_resellers) {
      results.condition.andWhere(`DATE_TRUNC('month', "data"."created") = :month`, {
        month: `${year}-${month}-01`,
      })
    } else {
      results.condition.andWhere(`"data"."created" >= :startDate AND "data"."created" < :endDate`, {
        startDate: `${year}-${month}-01`,
        endDate: DateTime.fromObject({ year, month }).plus({ months: 1 }).toFormat('yyyy-MM-dd'),
      })
    }

    results.condition.andWhere(`"deal"."userId" = :userId`, { userId })

    let selectClause, groupByClause

    if (by_resellers) {
      results.condition.leftJoinAndSelect('data.user', 'user')
      results.condition.leftJoinAndSelect('user.profile', 'profile')
      results.condition.leftJoinAndSelect('profile.profile_images', 'profile_images')

      selectClause = [
        `"user"."id" AS reseller_id`,
        `"user"."display_name" AS reseller_name`,
        `"user"."username" AS reseller_username`,
        `MAX("profile_images"."url") AS reseller_profile_image`,
        `COUNT(CASE WHEN "data"."type" = '${ResellingEventType.PURCHASE}' THEN 1 END) AS purchases`,
        `SUM(
          CASE 
            WHEN "data"."type" = '${ResellingEventType.PURCHASE}' THEN
              CAST("reward"."reward_value" AS DECIMAL)
            ELSE 0
          END
        ) AS commission`,
      ]
      groupByClause = `"user"."id", "user"."display_name", "user"."username"`
    } else {
      selectClause = [
        `DATE_TRUNC('day', "data"."created") AS day`,
        `COUNT(CASE WHEN "data"."type" = '${ResellingEventType.VIEW}' THEN 1 END) AS impressions`,
        `COUNT(DISTINCT 
          CASE 
            WHEN "data"."userId" IS NOT NULL THEN "data"."userId"::text 
            ELSE CONCAT("data"."device_info"->>'ip', ':', "data"."device_info"->>'userAgent') 
          END
        ) AS visits`,
        `COUNT(CASE WHEN "data"."type" = '${ResellingEventType.CLICK}' THEN 1 END) AS clicks`,
        `COUNT(CASE WHEN "data"."type" = '${ResellingEventType.PURCHASE}' THEN 1 END) AS conversions`,
        `SUM(
          CASE 
            WHEN "data"."type" = '${ResellingEventType.PURCHASE}' THEN
              CAST("reward"."reward_value" AS DECIMAL)
            ELSE 0
          END
        ) AS commission`,
      ]
      groupByClause = `DATE_TRUNC('day', "data"."created")`
    }

    results.condition.select(selectClause).groupBy(groupByClause)

    if (!by_resellers) {
      results.condition.orderBy(`DATE_TRUNC('day', "data"."created")`, 'DESC')
    } else {
      results.condition.orderBy(`"user"."display_name"`, 'ASC')
    }

    const rawData = await results.condition.getRawMany()

    let processedData, totals
    if (by_resellers) {
      processedData = rawData.map((item) => ({
        reseller_id: item.reseller_id,
        reseller_name: item.reseller_name,
        reseller_username: item.reseller_username,
        reseller_profile_image: item.reseller_profile_image,
        purchases: parseInt(item.purchases, 10) || 0,
        commission: parseFloat(item.commission) || 0,
      }))

      totals = processedData.reduce(
        (acc, item) => {
          acc.purchases += item.purchases
          acc.commission += item.commission
          return acc
        },
        { purchases: 0, commission: 0 },
      )
    } else {
      const daysInMonth = await generateDaysInMonth(year, month)
      const dailyDataMap = rawData.reduce((acc, item) => {
        const formattedDay = DateTime.fromJSDate(item.day).toISODate()
        acc[formattedDay] = {
          day: formattedDay,
          imps: parseInt(item.impressions, 10) || 0,
          visits: parseInt(item.visits, 10) || 0,
          clicks: parseInt(item.clicks, 10) || 0,
          conv: parseInt(item.conversions, 10) || 0,
          commission: parseFloat(item.commission) || 0,
          cvr:
            item.clicks > 0 ? parseFloat(((item.conversions / item.clicks) * 100).toFixed(2)) : 0,
        }
        return acc
      }, {})

      processedData = daysInMonth.map(
        (day) =>
          dailyDataMap[day] || {
            day,
            imps: 0,
            visits: 0,
            clicks: 0,
            conv: 0,
            commission: 0,
            cvr: 0,
          },
      )

      totals = processedData.reduce(
        (acc, item) => {
          acc.imps += item.imps
          acc.visits += item.visits
          acc.clicks += item.clicks
          acc.conv += item.conv
          acc.commission += item.commission
          return acc
        },
        { imps: 0, visits: 0, clicks: 0, conv: 0, commission: 0 },
      )

      const overallCVR =
        totals.clicks > 0 ? parseFloat(((totals.conv / totals.clicks) * 100).toFixed(2)) : 0
      totals.cvr = overallCVR
    }

    return {
      data: processedData,
      count: processedData.length,
      totals: totals,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
