import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'

export default async function (id: string) {
  try {
    const results: any = {
      pie_chart: {},
      deal_type_chart: {},
    }

    results.pie_chart = await this.entityManager.query(`WITH DonationProjectTagsData AS (
        SELECT 
          dp."id", 
          t."id" as tag_id, 
          t.name as tag_name,
          t."hex_color" as tag_color,
          (
            SELECT 
              COALESCE(
                SUM(d.amount), 
                0
              ) as total_donation 
            FROM
              user_donations d
            WHERE
              d."donationProjectId" = dp."id"
              AND d.status IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
              AND "userId" = '${id}'
          ) as total_donation 
        FROM 
          donation_projects dp 
          LEFT JOIN donation_projects_tags_tags dpt ON dp."id" = dpt."donationProjectsId" 
          LEFT JOIN tags t ON dpt."tagsId" = t."id"
      ), 
      NonprofitTagsData AS (
        SELECT
          np."id",
          t."id" as tag_id,
          t.name as tag_name,
          t."hex_color" as tag_color,
          (
            SELECT 
              COALESCE(
                SUM(d.amount), 
                0
              ) as total_donation 
            FROM 
              user_donations d 
            WHERE 
              d."donationProjectId" IN (
                SELECT "id" FROM "donation_projects" WHERE "status" = '${DonationProjectStatus.DEFAULT}'
              )
              AND d.status IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
              AND "userId" = '${id}'
          ) as total_donation 
        FROM 
          nonprofit_profiles np 
          LEFT JOIN nonprofit_profiles_tags_tags npt ON np."id" = npt."nonprofitProfilesId" 
          LEFT JOIN tags t ON npt."tagsId" = t."id"
      ), 
      TotalDonations AS (
        SELECT 
          id, 
          tag_id, 
          tag_name, 
          tag_color,
          total_donation 
        FROM 
          NonprofitTagsData 
        WHERE 
          total_donation > 0 
        UNION ALL 
        SELECT 
          id, 
          tag_id, 
          tag_name, 
          tag_color,
          total_donation 
        FROM 
          DonationProjectTagsData 
        WHERE 
          total_donation > 0
      ), 
      TagRatios AS (
        SELECT 
          tag_id, 
          tag_name,
          tag_color,
          SUM(total_donation) AS tag_total 
        FROM 
          TotalDonations 
        GROUP BY 
          tag_id, 
          tag_name,
          tag_color
      ) 
      SELECT 
        tr.tag_id, 
        tr.tag_name,
        tr.tag_color,
        CAST(
          (
            SUM(tr.tag_total) / SUM(
              SUM(tr.tag_total)
            ) OVER ()
          ) * 100 AS NUMERIC(10, 2)
        ) AS genre_ratio,
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'language', l."code",
                'language_name', l."name",
                'translation', tt.name
              ) ORDER BY tt."languageId"
            )
            FROM tag_translations tt
            JOIN languages l ON tt."languageId" = l."id"
            WHERE tr.tag_id = tt."tagId"
          ),
        '[]'::JSONB
      ) AS translations
      FROM
        TagRatios tr
      GROUP BY 
        tr.tag_id, 
        tr.tag_name,
        tr.tag_color
      ORDER BY 
        ROUND(
          (
            SUM(tr.tag_total) / SUM(
              SUM(tr.tag_total)
            ) OVER ()
          ) * 100, 
          2
        ) DESC;`)

    results.deal_type_chart = await this.entityManager.query(`WITH TotalDonations AS (
      SELECT 
        COALESCE(
          SUM(d.donation_amount), 
          0
        ) as total_donation, 
        dp.deal_type as deal_type 
      FROM 
        user_deal_item_payment d 
        LEFT JOIN deals dp ON d."dealId" = dp."id"
      WHERE 
        d.status IN ('${PAYMENT_STATUS.COMPLETED}', '${PAYMENT_STATUS.DONATION_SETTLED}')
        AND "senderId" = '${id}'
      GROUP BY 
        dp.deal_type
    ) 
    SELECT 
      d.deal_type, 
      COALESCE(
        SUM(d.total_donation), 
        0
      ) as total_donation, 
      COALESCE(
        ROUND(
          SUM(d.total_donation) / COALESCE(t.total_all_deals, 1) * 100, 
          2
        ), 
        0
      ) as donation_percentage 
    FROM 
      TotalDonations d 
      LEFT JOIN (
        SELECT 
          COALESCE(
            SUM(amount), 
            0
          ) as total_all_deals 
        FROM 
          user_donations 
        WHERE 
          status IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}') 
          AND reason IN ('${DonationType.AUCTION}', '${DonationType.BUYNOW}', '${DonationType.RAFFLE}')
          AND "userId" = '${id}'
      ) t ON 1 = 1 
    GROUP BY 
      d.deal_type, 
      t.total_all_deals;`)

    return results
  } catch (error) {
    return HandleErrors(error)
  }
}
