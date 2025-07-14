/**
 * @SQL - Get nonprofit profile image query
 * @param {string} N/A
 * @returns {string} - query
 */
export function GetNonprofitProfileImageQuery(alias: string): string {
  return `(SELECT
      "images"."url"
    FROM
      "images"
    WHERE "images"."id" = "${alias}"."profileImageId" LIMIT 1)`
}
