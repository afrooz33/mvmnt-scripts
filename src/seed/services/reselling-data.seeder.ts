import * as crypto from 'node:crypto'
import { faker } from '@faker-js/faker'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { DealType } from '@app/src/users/deal/enums'
import { AccountStatus, UserAccountType } from '@app/src/users/user/enums'
import { ResellingEventType } from '@app/src/users/reselling/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'

function generateUniqueToken(userId: string, dealId: string) {
  const hash = crypto.createHash('sha256')
  hash.update(userId + dealId + Date.now().toString())

  return hash.digest('hex')
}

export default async function (args) {
  try {
    const platforms = ['Windows', 'MacOS', 'Linux', 'iOS', 'Android']
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera']

    const total = Number.parseInt(args.total) || 10
    const totalEvents = faker.number.int({ min: 20, max: 100 })
    const totalCart = faker.number.int({ min: 2, max: 10 })
    const deals: ISeederEntity[] = await this.getDealsByType(DealType.BUYNOW)
    const users: ISeederEntity[] = await this.getUsers()

    await Promise.all(
      new Array(total).fill(0).map(async () => {
        let deal = faker.helpers.arrayElement(deals)

        if (args.deal) {
          deal = {
            id: args.deal,
          }
        }

        const userCondition = {
          select: ['id'],
          where: {
            account_status: AccountStatus.ENABLED,
            account_type: UserAccountType.INDIVIDUAL_INFLUENCER,
          },
        }

        const user: ISeederEntity = await this.entityManager.findOne('users', userCondition)
        const token = generateUniqueToken(user.id, deal.id)

        const resellingLink = await this.entityManager.upsert(
          'deal_reselling_links',
          {
            deal: {
              id: deal.id,
            },
            user: {
              id: user.id,
            },
            token,
          },
          ['user', 'deal'],
        )

        const resellingLinkId = resellingLink.raw[0].id

        for (let i = 0; i < totalEvents; i++) {
          const userId = faker.helpers.arrayElement(users).id
          const resellingEventType = faker.helpers.enumValue(ResellingEventType)

          await this.entityManager.save('deal_reselling_events', {
            reselling_link: {
              id: resellingLinkId,
            },
            type: resellingEventType,
            device_info: {
              userAgent: faker.internet.userAgent(),
              ip: faker.internet.ip(),
              platform: faker.helpers.arrayElement(platforms),
              browser: faker.helpers.arrayElement(browsers),
              deviceType: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
            },
            referrer: faker.internet.url(),
            deal: {
              id: deal.id,
            },
            user: {
              id: userId,
            },
          })

          let cartStatus = faker.helpers.enumValue(CartStatus)

          const variants: ISeederEntity[] = await this.getDealVariantByDeal(deal.id)
          const variant = faker.helpers.arrayElement(variants)

          if (resellingEventType === ResellingEventType.PURCHASE) {
            cartStatus = faker.helpers.arrayElement([
              CartStatus.COMPLETED,
              CartStatus.REVIEW_DEAL,
              CartStatus.WAITING_SHIPMENT,
            ])
          }

          for (let cartIndex = 0; cartIndex < totalCart; cartIndex++) {
            const quantity = faker.number.int({ min: 1, max: 10 })

            await this.entityManager.save('user_deal_buynow_cart', {
              status: cartStatus,
              user: {
                id: userId,
              },
              seller: {
                id: deal.userId,
              },
              total: variant.price * quantity,
              items: [
                {
                  deal: {
                    id: deal.id,
                  },
                  variant: {
                    id: variant.id,
                  },
                  quantity,
                  total: variant.price * quantity,
                },
              ],
            })
          }
        }
      }),
    )
  } catch (error) {
    console.error(error)
  }
}
