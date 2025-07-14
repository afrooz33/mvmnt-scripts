import { resolve } from 'node:path'
import { Repository } from 'typeorm'
import { readFileSync } from 'node:fs'
import { BrandEntity } from '@app/src/admin/brands/entities/brand.entity'
import { BrandTranslationEntity } from '@app/src/admin/brands/entities/brand.translation.entity'

export default async function () {
  const brands = JSON.parse(
    readFileSync(resolve(process.cwd(), 'src/seed/data/brands.json'), 'utf-8'),
  )

  const brandRepository: Repository<BrandEntity> = this.entityManager.getRepository(BrandEntity)
  const brandTranslationsRepository: Repository<BrandTranslationEntity> =
    this.entityManager.getRepository(BrandTranslationEntity)

  let displayOrderCounter = 1

  await Promise.all(
    brands.map(async (brand: any) => {
      try {
        let brandEntity = await brandRepository.findOne({
          where: {
            name: brand['en-US'],
          },
        })

        if (!brandEntity) {
          brandEntity = await brandRepository.save({
            name: brand['en-US'],
          })
        }

        brandEntity.display_order = displayOrderCounter++
        await brandRepository.save(brandEntity)

        const translations = [
          { code: 'ja-JP', name: brand['ja-JP'] },
          { code: 'ja-Kana', name: brand['ja-Kana'] },
        ]

        for (const translation of translations) {
          let brandTranslation = await brandTranslationsRepository.findOne({
            where: {
              brand: brandEntity,
              language: await this.getLanguagesByCode(translation.code),
            },
          })

          if (!brandTranslation) {
            brandTranslation = new BrandTranslationEntity()
            brandTranslation.brand = brandEntity
            brandTranslation.language = await this.getLanguagesByCode(translation.code)
            brandTranslation.name = translation.name
          }

          await brandTranslationsRepository.save(brandTranslation)
        }
      } catch (error) {
        console.error('Error processing brand:', brand['en-US'], error)
        throw error
      }
    }),
  )
}
