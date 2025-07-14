import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { BidStatus } from '@app/src/users/deal/bid/enums'

export default async function (total = 10) {
  const users: ISeederEntity[] = await this.getUsers()
  const deals: ISeederEntity[] = await this.getAuctionDeals()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const deal = faker.helpers.arrayElement(deals)
          const user = faker.helpers.arrayElement(users).id

          if (deal.userId === user) {
            resolve('success')
          }

          const userBid = await this.entityManager.findOne('user_deal_bids', {
            where: {
              user: { id: user },
              deal: { id: deal.id },
              status: BidStatus.AWARDED,
            },
            select: ['id'],
          })

          if (userBid) {
            resolve('success')
          }

          let delivery_cost = 0

          const quantity = faker.number.int({ min: 1, max: 10 })
          const bid_amount = faker.number.int({
            min: 100,
            max: 1000,
          })

          const shipping_fee = await this.entityManager.query(
            `SELECT * FROM "deal_shipping_fees" WHERE "dealId" = '${deal.id}' ORDER BY "min_amount" ASC;`,
          )

          if (shipping_fee) {
            for (const fee of shipping_fee) {
              if (
                bid_amount * quantity >= fee.min_amount &&
                (bid_amount * quantity <= fee.max_amount || !fee.max_amount)
              ) {
                delivery_cost = fee.fee
                break
              }
            }
          }

          await this.entityManager.save('user_deal_bids', {
            deal: deal.id,
            user,
            quantity,
            bid_amount,
            delivery_cost,
            total_amount: bid_amount * quantity + delivery_cost,
          })

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
