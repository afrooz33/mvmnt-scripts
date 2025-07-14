/**
 * Generate a referral code
 *
 * @param length number - length of the referral code, default is 8
 * @returns string - the generated referral code
 */
export function GenerateReferralCode(length = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  let result = ''
  const charactersLength = characters.length

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}
