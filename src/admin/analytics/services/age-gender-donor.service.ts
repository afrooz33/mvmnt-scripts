import { ExportToCsv } from 'export-to-csv'
import { ICsvAgeGenderDonator } from '@app/src/shared/interfaces'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GenerateDateRangeFilter } from '@app/src/shared/sql/common.sql'
import { DonationStatus } from '@app/src/donations/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { AgeGenderFilterQueryDto } from '@app/src/admin/analytics/dto'

export default async function (
  query: AgeGenderFilterQueryDto,
  csvExport = false,
): Promise<any | ICsvAgeGenderDonator> {
  try {
    let account_type_condition = ''
    const query_condition = GenerateDateRangeFilter({
      query: {
        date_filter: {
          start: query?.date_filter?.start,
          end: query?.date_filter?.end,
        },
      },
      field: 'created',
      alias: 'donation',
      condition: ' AND ',
    })

    if (query.account_type) {
      account_type_condition = ` AND "user"."account_type" = '${query.account_type}'`
    }

    const results = await this.entityManager.query(`WITH age_groups
      AS (
        SELECT unnest(ARRAY ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']) AS "age_group"
        )
        ,genders
      AS (
        SELECT unnest(ARRAY ['MALE', 'FEMALE']) AS "gender"
        )
      SELECT "ag"."age_group",
        "g"."gender",
        COALESCE("don"."donation_count", 0) AS "donation_count",
        ROUND(COALESCE("don"."ratio", 0), 2) AS "ratio"
      FROM "age_groups" "ag"
      CROSS JOIN "genders" "g"
      LEFT JOIN (
        SELECT CASE 
            WHEN EXTRACT(YEAR FROM AGE("profile"."birthday")) BETWEEN 13
                AND 17
              THEN '13-17'
            WHEN EXTRACT(YEAR FROM AGE("profile"."birthday")) BETWEEN 18
                AND 24
              THEN '18-24'
            WHEN EXTRACT(YEAR FROM AGE("profile"."birthday")) BETWEEN 25
                AND 34
              THEN '25-34'
            WHEN EXTRACT(YEAR FROM AGE("profile"."birthday")) BETWEEN 35
                AND 44
              THEN '35-44'
            WHEN EXTRACT(YEAR FROM AGE("profile"."birthday")) BETWEEN 45
                AND 54
              THEN '45-54'
            WHEN EXTRACT(YEAR FROM AGE("profile"."birthday")) BETWEEN 55
                AND 64
              THEN '55-64'
            ELSE '65+'
            END AS "age_group"
          ,"user"."gender"
          ,COUNT("donation"."id") AS "donation_count"
          ,COUNT("donation"."id") / SUM(COUNT(donation.id)) OVER (
            PARTITION BY CASE 
              WHEN EXTRACT(YEAR FROM AGE("profile"."birthday")) BETWEEN 13
                  AND 17
                THEN '13-17'
              WHEN EXTRACT(YEAR FROM AGE("profile"."birthday")) BETWEEN 18
                  AND 24
                THEN '18-24'
              WHEN EXTRACT(YEAR FROM AGE("profile"."birthday")) BETWEEN 25
                  AND 34
                THEN '25-34'
              WHEN EXTRACT(YEAR FROM AGE("profile"."birthday")) BETWEEN 35
                  AND 44
                THEN '35-44'
              WHEN EXTRACT(YEAR FROM AGE("profile"."birthday")) BETWEEN 45
                  AND 54
                THEN '45-54'
              WHEN EXTRACT(YEAR FROM AGE("profile"."birthday")) BETWEEN 55
                  AND 64
                THEN '55-64'
              ELSE '65+'
              END
            ) AS ratio
        FROM "user_donations" "donation"
        INNER JOIN "users" "user" ON "donation"."userId" = "user"."id"
        LEFT JOIN "user_identity_documents" "profile" ON "profile"."userId" = "user"."id"
        WHERE "donation"."status" = '${DonationStatus.SUCCESS}'
        AND "user"."account_status" != '${AccountStatus.DELETED}'${query_condition}${account_type_condition}
        GROUP BY "age_group"
          ,"user"."gender"
        ) don ON ag.age_group = don.age_group
        AND "g"."gender" = "don"."gender"::text
      ORDER BY "ag"."age_group"
        ,"g"."gender"`)

    if (csvExport) {
      const csvData: ICsvAgeGenderDonator[] = results.map((item) => ({
        'Age group': item.age_group,
        Gender: item.gender,
        'Total donation count': item.donation_count,
        Ratio: item.ratio,
      }))

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return await results
  } catch (error) {
    return HandleErrors(error)
  }
}
