/**
 * @SQL - Get donation project image query
 * @param {string} N/A
 * @returns {string} - query
 */
export function GetDonationProjectImageQuery(condition: string): string {
  return `(SELECT
      "images"."url"
    FROM
      "images"
    LEFT JOIN
      "donation_projects_images_images" "donation_project_images" ON "donation_project_images"."imagesId" = "images"."id"
    WHERE ${condition} LIMIT 1)`
}
