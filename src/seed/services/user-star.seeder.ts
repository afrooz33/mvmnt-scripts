import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { CONTRIBUTION_STAR_AMOUNT } from '@app/src/users/stars/constants'
import { StarType, StarActionType, ContributionStarType } from '@app/src/users/stars/enums'

export default async function (total = 500) {
  const deals: ISeederEntity[] = await this.getDeals()
  const users: ISeederEntity[] = await this.getUsers()
  const nonprofits: ISeederEntity[] = await this.getNonprofits()
  const fundraisers: ISeederEntity[] = await this.getRE2Fundraisers()
  const donationProjects: ISeederEntity[] = await this.getDonationProjects()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      try {
        const user = faker.helpers.arrayElement(users)?.id
        const starType = faker.helpers.arrayElement(Object.values(StarType))

        let stars: number
        let action: StarActionType | ContributionStarType
        let deal: string | null = null
        let nonprofit: string | null = null
        let fundraiser: string | null = null
        let donationProject: string | null = null

        if (starType === StarType.CONTRIBUTION) {
          action = faker.helpers.arrayElement(
            Object.values(ContributionStarType) as ContributionStarType[],
          )
          stars = CONTRIBUTION_STAR_AMOUNT[action] || 0

          // Set related entities based on action
          if (action === ContributionStarType.DIRECT_DONATION) {
            nonprofit = faker.helpers.arrayElement(nonprofits)?.id
          } else if (action === ContributionStarType.SHARE_FUNDRAISER) {
            fundraiser = faker.helpers.arrayElement(fundraisers)?.id
          } else if (action === ContributionStarType.SHARE_DONATION_PROJECT) {
            donationProject = faker.helpers.arrayElement(donationProjects)?.id
          } else if (action === ContributionStarType.SHARE_DEAL) {
            deal = faker.helpers.arrayElement(deals)?.id
          }
        } else if (starType === StarType.TRANSACTION) {
          action = faker.helpers.arrayElement([
            StarActionType.SALE_RAFFLE,
            StarActionType.SALE_BUYNOW,
            StarActionType.SALE_AUCTION,
            StarActionType.RESALE_BUYNOW,
            StarActionType.PURCHASE_RAFFLE,
            StarActionType.PURCHASE_BUYNOW,
            StarActionType.PURCHASE_AUCTION,
          ])
          stars = faker.number.int({ min: 10, max: 100 })

          // Set deal-related data for transaction actions
          deal = faker.helpers.arrayElement(deals)?.id
        } else if (starType === StarType.DONATION) {
          action = faker.helpers.arrayElement([
            StarActionType.RE2_DONATION,
            StarActionType.DONATION_BUYNOW,
            StarActionType.DIRECT_DONATION,
            StarActionType.DONATION_RAFFLE,
            StarActionType.RESALE_DONATION,
            StarActionType.DONATION_AUCTION,
          ])
          stars = faker.number.int({ min: 20, max: 100 })

          // Set related entities for donation actions
          if (
            action === StarActionType.DIRECT_DONATION ||
            action === StarActionType.DONATION_BUYNOW
          ) {
            nonprofit = faker.helpers.arrayElement(nonprofits)?.id
          } else if (action === StarActionType.RE2_DONATION) {
            donationProject = faker.helpers.arrayElement(donationProjects)?.id
          }
        }

        await this.entityManager.save('user_stars', {
          user,
          type: starType,
          action,
          stars,
          deal,
          nonprofit,
          fundraiser,
          donation_project: donationProject,
        })
      } catch (error) {
        console.error('Error seeding user stars:', error)
      }
    }),
  )
}
