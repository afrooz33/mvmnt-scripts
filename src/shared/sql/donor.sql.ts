/**
 * @SQL - Get donor details
 * @param {string} condition
 * @returns {string} - query
 */
export function GetDonorSocialAccountQuery(condition: string): string {
  return `(SELECT "social_accounts" FROM "user_profiles" WHERE "userId" = ${condition})`
}
