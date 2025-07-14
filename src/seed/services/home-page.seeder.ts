import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import {
  Conditions,
  ContentSelection,
  Fields,
  HomepageContentSearchType,
  HomepageTitle,
} from '@app/src/admin/homepages/enums'

export default async function (total = 10) {
  const deals: ISeederEntity[] = await this.getDeals()
  const users: ISeederEntity[] = await this.getUsers()
  const brands: ISeederEntity[] = await this.getBrands()
  const categories: ISeederEntity[] = await this.getCategory()
  const languages: ISeederEntity[] = await this.getLanguages()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          let selection = ContentSelection.MANUAL
          const search_conditions = []
          const type = faker.helpers.enumValue(HomepageTitle)
          const search_type = faker.helpers.enumValue(HomepageContentSearchType)

          if (faker.datatype.boolean()) {
            selection = ContentSelection.AUTO
          }

          if (selection === ContentSelection.AUTO) {
            search_conditions.push({
              field: Fields.DEAL_NAME,
              condition: Conditions.CONTAINS,
              values: faker.commerce.productName(),
            })
          }

          const homepage = await this.entityManager.save('homepages', {
            display_order: faker.number.int({ min: 1, max: 20 }),
            type,
            title: faker.lorem.words(4),
            selection,
            search_type,
            search_conditions,
            translations: [
              {
                language: faker.helpers.arrayElement(languages).id,
                title: faker.lorem.words(4),
              },
            ],
          })

          const contents = new Array(15).fill(0).map(() => {
            const data: any = {
              homepage,
            }

            if (type === HomepageTitle.BRAND_LIST) {
              data.brand = faker.helpers.arrayElement(brands).id
            }

            if (type === HomepageTitle.USER_LIST) {
              data.user = faker.helpers.arrayElement(users).id
            }

            if (type === HomepageTitle.CATEGORY_LIST) {
              data.category = faker.helpers.arrayElement(categories).id
            }

            if (type === HomepageTitle.CUSTOM_LIST || type === HomepageTitle.EDITOR_PICKS) {
              if (
                search_type === HomepageContentSearchType.DEALS &&
                selection === ContentSelection.MANUAL
              ) {
                data.deal = faker.helpers.arrayElement(deals).id
              } else if (
                search_type === HomepageContentSearchType.USERS &&
                selection === ContentSelection.MANUAL
              ) {
                data.user = faker.helpers.arrayElement(users).id
              }
            }

            return data
          })

          await this.entityManager.save('homepage_contents', contents)

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
