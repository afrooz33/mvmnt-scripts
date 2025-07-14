import { faker } from '@faker-js/faker'
import { UploadType } from '@app/src/shared/enums'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { DealType, DealStatus } from '@app/src/users/deal/enums'
import { PurchaseStatus } from '@app/src/users/deal/raffle-purchase/enums'

export default async function (total = 10) {
  const users: ISeederEntity[] = await this.getUsers()
  const deals: ISeederEntity[] = await this.getDealsByType(DealType.RAFFLE)

  try {
    await Promise.all(
      new Array(total).fill(0).map(async () => {
        const deal = faker.helpers.arrayElement(deals)
        const user = faker.helpers.arrayElement(users)

        let prizes = await this.getRafflePrize(deal.id)

        if (!prizes) {
          const images = await this.entityManager.save('images', [
            await this.getFakerImage(UploadType.DEAL, true),
            ...Array(4)
              .fill(null)
              .map(() => this.getFakerImage(UploadType.DEAL)),
          ])

          await this.entityManager.save('deal_raffle_prizes', {
            raffles: { id: deal.id },
            images,
            number_of_winners: faker.number.int({ min: 1, max: 5 }),
            name: faker.commerce.productName(),
            rank: faker.number.int({ min: 1, max: 5 }),
          })

          prizes = await this.getRafflePrize(deal.id)
        }

        // Insert raffle purchases
        const purchasePromises = Array.from(
          { length: faker.number.int({ min: 10, max: 100 }) },
          async () => {
            return this.entityManager.save('user_deal_raffle_purchases', {
              raffle_ticket_price: deal.starting_price,
              quantity: 1,
              total_amount: deal.starting_price,
              user: { id: user.id },
              deal: { id: deal.id },
              status: faker.helpers.enumValue(PurchaseStatus),
            })
          },
        )

        await Promise.all(purchasePromises)

        // Fetch purchase results for raffle

        const purchases = await this.getRafflePurchase(deal.id)
        const winners = []

        // Assign winners for each prize
        for (const prize of prizes) {
          for (let i = 0; i < prize.number_of_winners; i++) {
            const winner = purchases[Math.floor(Math.random() * purchases.length)]
            purchases.splice(
              purchases.findIndex((p) => p.user === winner.user),
              1,
            )

            winners.push({ winner, prize })
          }
        }

        const uniqueWinners = winners.reduce((acc, winner) => {
          const exists = acc.some(
            (w) => w.winnerId === winner.winnerId && w.prizeId === winner.prizeId,
          )
          if (!exists) acc.push(winner)
          return acc
        }, [])

        await this.entityManager
          .createQueryBuilder()
          .insert()
          .into('user_deal_raffle_winner')
          .values(uniqueWinners)
          .orUpdate(['winnerId', 'prizeId'], ['winnerId', 'prizeId'], {
            skipUpdateIfNoValuesChanged: true,
          })
          .execute()

        await this.entityManager.query(
          `UPDATE "user_deal_raffle_purchases" SET "status" = '${PurchaseStatus.COMPLETED}' WHERE "dealId" = '${deal.id}' AND "status" = '${PurchaseStatus.ON_DEAL}';`,
        )

        await this.entityManager.query(
          `UPDATE "deals" SET "status" = '${DealStatus.ENDED}' WHERE "id" = '${deal.id}';`,
        )
      }),
    )
  } catch (error) {
    console.error(error)
  }
}
