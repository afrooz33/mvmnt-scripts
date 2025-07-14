import { resolve } from 'path'
import * as csv from 'csvtojson'
import { Repository } from 'typeorm'
import { DealCategoryType } from '@app/src/admin/deals/category/enums'
import { DealCategoryEntity } from '@app/src/admin/deals/category/entities/deal-category.entity'
import { DealCategoryTranslationEntity } from '@app/src/admin/deals/category/entities/deal-category.translation.entity'

const promiseDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function createJSONStructure(englishFilePath, additionalFilePaths, languageCodes) {
  const data = await Promise.all([
    csv().fromFile(englishFilePath),
    ...additionalFilePaths.map((filePath) => csv().fromFile(filePath)),
  ])

  const jsonData = []
  let currentBigCategoryOrder = 1
  const currentMidCategoryOrder = {}

  data[0].forEach((englishRow, index) => {
    const englishBigCategory = englishRow['Big category'].trim()
    const englishMidCategory = englishRow['Mid category'].trim()
    const englishSmallCategory = englishRow['Small category'].trim()

    let bigCategoryObj = jsonData.find((category) => category.name === englishBigCategory)

    if (!bigCategoryObj) {
      bigCategoryObj = {
        name: englishBigCategory,
        display_order: currentBigCategoryOrder++,
        translations: [],
        children: [],
      }

      currentMidCategoryOrder[englishBigCategory] = 1

      languageCodes.forEach((languageCode, i) => {
        bigCategoryObj.translations.push({
          name: data[i + 1][index]['Big category'].trim(),
          language: languageCode,
        })
      })

      jsonData.push(bigCategoryObj)
    }

    let midCategoryObj = bigCategoryObj.children.find(
      (category) => category.name === englishMidCategory,
    )

    if (!midCategoryObj) {
      midCategoryObj = {
        name: englishMidCategory,
        display_order: currentMidCategoryOrder[englishBigCategory]++,
        translations: [],
        children: [],
      }

      languageCodes.forEach((languageCode, i) => {
        midCategoryObj.translations.push({
          name: data[i + 1][index]['Mid category'].trim(),
          language: languageCode,
        })
      })

      bigCategoryObj.children.push(midCategoryObj)
    }

    const smallCategoryObj = {
      name: englishSmallCategory,
      display_order: index + 1,
      translations: [],
    }

    languageCodes.forEach((languageCode, i) => {
      smallCategoryObj.translations.push({
        name: data[i + 1][index]['Small category'].trim(),
        language: languageCode,
      })
    })

    midCategoryObj.children.push(smallCategoryObj)
  })

  return jsonData
}

export default async function () {
  const englishFilePath = resolve(process.cwd(), 'src/seed/csv/english-categories.csv')
  const languageCodes = ['ja-JP', 'de-DE', 'zh-CN', 'fr-FR', 'it-IT', 'es-ES', 'hi-IN']

  const additionalFilePaths = [
    resolve(process.cwd(), 'src/seed/csv/japanese-categories.csv'),
    resolve(process.cwd(), 'src/seed/csv/german-categories.csv'),
    resolve(process.cwd(), 'src/seed/csv/chinese-categories.csv'),
    resolve(process.cwd(), 'src/seed/csv/french-categories.csv'),
    resolve(process.cwd(), 'src/seed/csv/italian-categories.csv'),
    resolve(process.cwd(), 'src/seed/csv/spanish-categories.csv'),
    resolve(process.cwd(), 'src/seed/csv/hindi-categories.csv'),
  ]

  const categories = await createJSONStructure(englishFilePath, additionalFilePaths, languageCodes)

  const dealCategoryRepository: Repository<DealCategoryEntity> =
    this.entityManager.getRepository(DealCategoryEntity)
  const dealCategoryTranslationRepository: Repository<DealCategoryTranslationEntity> =
    this.entityManager.getRepository(DealCategoryTranslationEntity)

  for (const category of categories) {
    await promiseDelay(5000) // Optional delay

    let bigCategory = await dealCategoryRepository.findOne({
      where: { name: category.name, type: DealCategoryType.BIG },
    })

    if (!bigCategory) {
      bigCategory = new DealCategoryEntity()
      bigCategory.name = category.name
      bigCategory.type = DealCategoryType.BIG
    }

    bigCategory.display_order = category.display_order
    bigCategory = await dealCategoryRepository.save(bigCategory)

    for (const translation of category.translations) {
      let categoryTranslation = await dealCategoryTranslationRepository.findOne({
        where: { category: { id: bigCategory.id }, language: { code: translation.language } },
      })

      if (!categoryTranslation) {
        categoryTranslation = new DealCategoryTranslationEntity()
        categoryTranslation.language = await this.getLanguagesByCode(translation.language)
        categoryTranslation.category = bigCategory
      }

      categoryTranslation.name = translation.name

      await dealCategoryTranslationRepository.save(categoryTranslation)
    }

    for (const midCategory of category.children) {
      let mid = await dealCategoryRepository.findOne({
        where: {
          name: midCategory.name,
          type: DealCategoryType.MIDDLE,
          parent: { id: bigCategory.id },
        },
      })
      if (!mid) {
        mid = new DealCategoryEntity()
        mid.name = midCategory.name
        mid.type = DealCategoryType.MIDDLE
        mid.parent = bigCategory
      }
      mid.display_order = midCategory.display_order
      mid = await dealCategoryRepository.save(mid)

      for (const translation of midCategory.translations) {
        let categoryTranslation = await dealCategoryTranslationRepository.findOne({
          where: { category: { id: mid.id }, language: { code: translation.language } },
        })
        if (!categoryTranslation) {
          categoryTranslation = new DealCategoryTranslationEntity()
          categoryTranslation.language = await this.getLanguagesByCode(translation.language)
          categoryTranslation.category = mid
        }
        categoryTranslation.name = translation.name
        await dealCategoryTranslationRepository.save(categoryTranslation)
      }

      for (const smallCategory of midCategory.children) {
        let small = await dealCategoryRepository.findOne({
          where: { name: smallCategory.name, type: DealCategoryType.SMALL, parent: { id: mid.id } },
        })
        if (!small) {
          small = new DealCategoryEntity()
          small.name = smallCategory.name
          small.type = DealCategoryType.SMALL
          small.parent = mid
        }
        small.display_order = smallCategory.display_order
        small = await dealCategoryRepository.save(small)

        for (const translation of smallCategory.translations) {
          let categoryTranslation = await dealCategoryTranslationRepository.findOne({
            where: { category: { id: small.id }, language: { code: translation.language } },
          })

          if (!categoryTranslation) {
            categoryTranslation = new DealCategoryTranslationEntity()
            categoryTranslation.language = await this.getLanguagesByCode(translation.language)
            categoryTranslation.category = small
          }

          categoryTranslation.name = translation.name
          await dealCategoryTranslationRepository.save(categoryTranslation)
        }
      }
    }
  }
}
