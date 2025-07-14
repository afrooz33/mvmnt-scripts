import { DONATION_STATUS } from '@app/src/donations/enums'
import { NotificationSettingType } from '@app/src/notifications/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

/**
 * @SQL - Get donor notification setting query
 * @param {string} nonprofitId - nonprofit user id
 * @returns {string} - query
 */
export function GetDonatedUserNotificationSettingQuery(nonprofitId: string): string {
  return `WITH donations_to_nonprofit_or_project AS (
    SELECT 
      * 
    FROM 
      "user_donations" 
    WHERE 
      "status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
      AND "donationProjectId" IN (
        SELECT 
          "id" 
        FROM 
          "donation_projects"
        WHERE 
          "userId" = '${nonprofitId}'
      )
  ) 
  SELECT 
    DISTINCT u."id" 
  FROM 
    donations_to_nonprofit_or_project d 
    JOIN "users" u ON u.id = d."userId" 
    JOIN "notification_settings" ns ON ns."userId" = u.id 
  WHERE 
    "ns"."type" = '${NotificationSettingType.NEW_ACTIVITY_REPORT_NONPROFIT}'
    AND ns.status = true;`
}

export function GetNonprofitDonatedUserQuery(nonprofitId: string): string {
  return `SELECT 
    DISTINCT "u"."id"
  FROM
    "user_donations" "d"
    JOIN "users" "u" ON "u"."id" = "d"."userId"
    JOIN "notification_settings" "ns" ON "ns"."userId" = "u"."id"
  WHERE
    "d"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
    AND "d"."donationProjectId" IN (SELECT "id" FROM "donation_projects" WHERE "userId" = '${nonprofitId}' AND "status" = '${DonationProjectStatus.DEFAULT}')
    AND "ns"."type" = '${NotificationSettingType.NEW_ACTIVITY_REPORT_NONPROFIT}'
    AND ns.status = true;`
}

export function GetDonationProjectDonatedUserQuery(donationProjectId: string): string {
  return `SELECT 
    DISTINCT "u"."id"
  FROM
    "user_donations" "d"
    JOIN "users" "u" ON "u"."id" = "d"."userId"
    JOIN "notification_settings" "ns" ON "ns"."userId" = "u"."id"
  WHERE
    "d"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
    AND "d"."donationProjectId" = '${donationProjectId}'
    AND "ns"."type" = '${NotificationSettingType.NEW_ACTIVITY_REPORT_NONPROFIT}'
    AND ns.status = true;`
}
