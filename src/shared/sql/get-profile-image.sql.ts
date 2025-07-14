/**
 * @SQL - Get profile image query
 * @param {string} N/A
 * @returns {string} - query
 */
export function GetProfileImageQuery(): string {
  return `(SELECT
      "images"."url"
    FROM
      "images"
    WHERE "images"."id" = "profile"."profileImagesId" LIMIT 1)`
}
