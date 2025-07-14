import { faker } from '@faker-js/faker/locale/ja'
import { UploadType } from '@app/src/shared/enums'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import {
  DealType,
  DealStatus,
  DonationType,
  ItemCondition,
  DealAvailability,
  DealCurrencyType,
  ShippingCoveredBy,
  PurchaseAvailability,
} from '@app/src/users/deal/enums'

export default async function (total = 100) {
  const isNonprofit = faker.datatype.boolean()
  // const users: ISeederEntity[] = await this.getUsers()
  const brands: ISeederEntity[] = await this.getBrands()
  // const nonprofitUser: ISeederEntity[] = await this.getNonprofits()
  const categories: ISeederEntity[] = await this.getSmallCategory()
  const shippingMethods: ISeederEntity[] = await this.getShippingMethods()
  // const donationProject: ISeederEntity[] = await this.getDonationProjects()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          let deal_access_date
          let start_date = faker.date.past()

          // const purchase_availability: PurchaseAvailability =
          //   faker.helpers.enumValue(PurchaseAvailability)
          const purchase_availability: PurchaseAvailability = PurchaseAvailability.IMMEDIATELY

          const dealType: DealType = faker.helpers.enumValue(DealType)
          // const deal_availability: DealAvailability = faker.helpers.enumValue(DealAvailability)
          const deal_availability: DealAvailability = DealAvailability.SPECIFIC_DATE

          // if (deal_availability === DealAvailability.SPECIFIC_DATE) {
          //   deal_access_date = faker.date.future()
          // }

          // if (purchase_availability === PurchaseAvailability.SPECIFIC_DATE) {
          //   start_date = faker.date.future()
          // }
          start_date = deal_access_date = faker.date.past()

          const images = await this.entityManager.save('images', [
            await this.getFakerImage(UploadType.DEAL, true),
            await this.getFakerImage(UploadType.DEAL, false),
            await this.getFakerImage(UploadType.DEAL, false),
            await this.getFakerImage(UploadType.DEAL, false),
            await this.getFakerImage(UploadType.DEAL, false),
          ])

          const deal: any = {
            purchase_availability,
            deal_availability,
            deal_access_date,
            deal_type: dealType,
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            size: faker.commerce.productAdjective(),
            images,
            category: {
              id: faker.helpers.arrayElement(categories).id,
            },
            brand: {
              id: faker.helpers.arrayElement(brands).id,
            },
            item_condition: faker.helpers.enumValue(ItemCondition),
            shipping_covered_by: faker.helpers.enumValue(ShippingCoveredBy),
            shipping_method: {
              id: faker.helpers.arrayElement(shippingMethods).id,
            },
            sender_location: faker.location.streetAddress(),
            estimated_delivery_days: faker.number.int(10),
            starting_price: faker.commerce.price(),
            start_date,
            end_date: faker.date.future(),
            user: {
              // id: faker.helpers.arrayElement(users).id,
              id: faker.helpers.arrayElement([
                'dffe0abe-2e49-4ea0-86a8-e93453573da7',
                'a934946b-9262-44e2-91ec-8ad23881faa5',
                '0705ea08-6275-404d-ac11-3824bcc0798f',
                '4576b67f-8349-4fbb-8ee3-eccca917beb0',
                'ad79d554-6348-472e-9348-8c9df72fdb12',
                '0421f659-85bf-4dea-bf61-9afeeb610dea',
                '61a116df-d8a9-4be4-a9ff-68e3b2e69ce5',
              ]),
            },
            donation_type: faker.helpers.enumValue(DonationType),
            donation_amount: faker.commerce.price(),
            // status: faker.helpers.enumValue(DealStatus),
            status: DealStatus.ON_DEAL,
            currency: faker.helpers.enumValue(DealCurrencyType),
            shipping_fee: [
              {
                min_amount: faker.number.int({ min: 100, max: 500 }),
                max_amount: faker.number.int({ min: 501, max: 1000 }),
                fee: faker.number.int({ min: 10, max: 100 }),
              },
              {
                min_amount: faker.number.int({ min: 501, max: 2000 }),
                max_amount: faker.number.int({ min: 2001, max: 5000 }),
                fee: faker.number.int({ min: 100, max: 200 }),
              },
              {
                min_amount: faker.number.int({ min: 2001, max: 5000 }),
                fee: faker.number.int({ min: 200, max: 300 }),
              },
            ],
            // donation_project: isNonprofit ? null : faker.helpers.arrayElement(donationProject).id,
            // donation_nonprofit: isNonprofit ? faker.helpers.arrayElement(nonprofitUser).id : null,
            donation_project: isNonprofit ? null : 'a8b6f495-164d-4cd8-9612-3a101ca52d22',
            donation_nonprofit: isNonprofit ? 'cd3e73cc-ef07-40b7-a332-a9cb84270238' : null,
          }

          if (dealType === DealType.RAFFLE) {
            deal.raffles = {
              price_details: faker.lorem.words(10),
              donation_reason: faker.commerce.productDescription(),
              donation_rules: faker.lorem.words(20),
              winner_announcement_date: faker.date.future(),
              raffle_prizes: [
                {
                  rank: 1,
                  name: faker.commerce.productName(),
                  description: faker.commerce.productDescription(),
                  images: await this.entityManager.save('images', [
                    await this.getFakerImage(UploadType.DEAL, true),
                    await this.getFakerImage(UploadType.DEAL),
                    await this.getFakerImage(UploadType.DEAL),
                  ]),
                  number_of_winners: faker.number.int({ min: 10, max: 25 }),
                },
                {
                  rank: 2,
                  name: faker.commerce.productName(),
                  description: faker.commerce.productDescription(),
                  images: await this.entityManager.save('images', [
                    await this.getFakerImage(UploadType.DEAL, true),
                    await this.getFakerImage(UploadType.DEAL),
                    await this.getFakerImage(UploadType.DEAL),
                  ]),
                  number_of_winners: faker.number.int({ min: 10, max: 25 }),
                },
                {
                  rank: 3,
                  name: faker.commerce.productName(),
                  description: faker.commerce.productDescription(),
                  images: await this.entityManager.save('images', [
                    await this.getFakerImage(UploadType.DEAL, true),
                    await this.getFakerImage(UploadType.DEAL),
                    await this.getFakerImage(UploadType.DEAL),
                  ]),
                  number_of_winners: faker.number.int({ min: 10, max: 25 }),
                },
              ],
            }
          }

          const savedDeal = await this.entityManager.save('deals', deal)

          if (dealType === DealType.BUYNOW) {
            for (let index = 0; index < faker.number.int({ min: 2, max: 10 }); index++) {
              await this.entityManager.save('deal_variants', {
                deal: savedDeal,
                price: faker.commerce.price(),
                images: await this.entityManager.save('images', [
                  await this.getFakerImage(UploadType.DEAL, true),
                  await this.getFakerImage(UploadType.DEAL),
                  await this.getFakerImage(UploadType.DEAL),
                ]),
                option_values: [
                  {
                    value: faker.internet.color(),
                    option: await this.getDealOptionByType('COLOR'),
                    label_name: faker.color.human(),
                  },
                  {
                    value: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
                    option: await this.getDealOptionByType('SIZE'),
                  },
                  {
                    value: faker.helpers.arrayElement(['Leather', 'Cotton', 'Silk']),
                    option: await this.getDealOptionByType('MATERIAL'),
                  },
                  {
                    option: await this.getDealOptionByType('WEIGHT'),
                    value: faker.helpers.arrayElement(['1kg', '2kg', '3kg']),
                  },
                ],
              })
            }
          }

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
