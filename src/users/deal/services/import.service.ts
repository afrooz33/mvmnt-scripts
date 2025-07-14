import { parse } from 'csv-parse'
import { In, IsNull } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, UploadType } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealType } from '@app/src/users/deal/enums'
import { DealCategoryType } from '@app/src/admin/deals/category/enums'

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024

async function validateShippingFees(shippingFees): Promise<boolean> {
  if (!Array.isArray(shippingFees)) {
    return HandleErrors(new PreconditionFailedException(ErrorKey.INVALID_SHIPPING_FEES))
  }

  for (const fee of shippingFees) {
    if (!('min_amount' in fee) || !('fee' in fee)) {
      return HandleErrors(new PreconditionFailedException(ErrorKey.INVALID_SHIPPING_FEES))
    }

    if (typeof fee.min_amount !== 'number' || typeof fee.fee !== 'number') {
      return HandleErrors(new PreconditionFailedException(ErrorKey.INVALID_SHIPPING_FEES))
    }

    if ('max_amount' in fee) {
      if (typeof fee.max_amount !== 'number' || fee.max_amount <= fee.min_amount) {
        return HandleErrors(new PreconditionFailedException(ErrorKey.INVALID_SHIPPING_FEES))
      }
    }

    if (fee.fee < 1) {
      return HandleErrors(new PreconditionFailedException(ErrorKey.INVALID_SHIPPING_FEES))
    }
  }

  return true
}

export default async function importDeals(
  file: Express.Multer.File,
  userId: string,
): Promise<SuccessRO> {
  try {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return HandleErrors(new PreconditionFailedException(ErrorKey.FILE_TOO_LARGE))
    }

    const shippingProfile = await this.entityManager.findOne('shipping_profiles', {
      where: {
        user: {
          id: userId,
        },
        all_deals: true,
      },
    })

    const fileContent = file.buffer.toString('utf8')

    const data: [] = await new Promise((resolve, reject) => {
      parse(
        fileContent,
        {
          delimiter: ',',
          columns: true,
          skip_empty_lines: true,
          relax_column_count: true,
          cast: (value) => (value.toLocaleLowerCase() === 'null' ? null : value),
        },
        (err, output) => {
          if (err) {
            reject(err)
          } else {
            resolve(output)
          }
        },
      )
    })

    const sizeOption = await this.entityManager.findOne('deal_options', {
      where: {
        type: 'SIZE',
      },
      select: ['id'],
    })

    const colorOption = await this.entityManager.findOne('deal_options', {
      where: {
        type: 'COLOR',
      },
      select: ['id'],
    })

    const materialOption = await this.entityManager.findOne('deal_options', {
      where: {
        type: 'MATERIAL',
      },
      select: ['id'],
    })

    const weightOption = await this.entityManager.findOne('deal_options', {
      where: {
        type: 'WEIGHT',
      },
      select: ['id'],
    })

    const mappedDeals = []
    const groupedProducts: any = {}
    const dealKeys = {
      name: 'Name',
      rules: 'Rules',
      images: 'Images',
      size: 'Item size',
      brand: 'Item brand',
      deal_type: 'Deal type',
      currency: 'Deal currency',
      end_date: 'Deal end date',
      prize_title: 'Prize Title',
      prize_images: 'Prize Images',
      shipping_fee: 'Shipping fee',
      start_date: 'Deal start date',
      prize_details: 'Prize detail',
      donation_type: 'Donation type',
      variant_price: 'Variant Price',
      description: 'Item description',
      starting_price: 'Starting price',
      item_condition: 'Item condition',
      variant_images: 'Variant Images',
      category_big: 'Item category big',
      sender_location: 'Sender location',
      shipping_method: 'Shipping method',
      variant_quantity: 'Variant Quantity',
      category_small: 'Item category small',
      winner_drawn_date: 'Winner drawn date',
      total_prize_winner: 'Prize No. Winner',
      category_middle: 'Item category middle',
      donation_nonprofit: 'Donate to nonprofit',
      shipping_covered_by: 'Shipping covered by',
      estimated_delivery_days: 'Days to send item',
      donation_amount: 'Donation amount per order',
      donation_project: 'Donate to donation project',
      raffle_why_donate: 'Why donate & what is donation used for',
    }

    for (const obj of data) {
      const name = obj[dealKeys.name]

      if (!groupedProducts[name]) {
        groupedProducts[name] = []
      }

      groupedProducts[name].push(obj)
    }

    for (const name in groupedProducts) {
      if (groupedProducts.hasOwnProperty(name)) {
        const mappedObject = {
          variants: [],
          options: [],
          raffles: {},
        }

        const products = groupedProducts[name]

        Object.keys(dealKeys).forEach((key) => {
          const mappedKey = dealKeys[key]
          const values = products.map((product) => product[mappedKey]).filter(Boolean)

          if (values.length > 0) {
            mappedObject[key] = values[0]
          }
        })

        const uniqueOptions = new Set()
        const isRaffle = products.some((product) => product[dealKeys.deal_type] === DealType.RAFFLE)
        const isBuynow = products.some((product) => product[dealKeys.deal_type] === DealType.BUYNOW)

        if (isBuynow) {
          let starting_price = Number.POSITIVE_INFINITY

          for (const product of products) {
            const price = parseFloat(product[dealKeys.variant_price])
            const quantity = parseInt(product[dealKeys.variant_quantity])

            if (price > 0 && quantity > 0) {
              const optionValues = []

              for (let i = 1; i <= 4; i++) {
                const optionName = product[`Option${i} Name`]
                const optionValue = product[`Option${i} Value`]

                if (optionName && optionValue) {
                  if (optionName.toLowerCase() === 'color') {
                    uniqueOptions.add(colorOption.id)

                    optionValues.push({
                      option: colorOption,
                      value: optionValue,
                    })
                  } else if (optionName.toLowerCase() === 'size') {
                    uniqueOptions.add(sizeOption.id)

                    optionValues.push({
                      option: sizeOption,
                      value: optionValue,
                    })
                  } else if (optionName.toLowerCase() === 'material') {
                    uniqueOptions.add(materialOption.id)

                    optionValues.push({
                      option: materialOption,
                      value: optionValue,
                    })
                  } else if (optionName.toLowerCase() === 'weight') {
                    uniqueOptions.add(weightOption.id)

                    optionValues.push({
                      option: weightOption,
                      value: optionValue,
                    })
                  }
                }
              }

              mappedObject.variants.push({
                price,
                quantity,
                remaining_quantity: quantity,
                images: product[dealKeys.variant_images].split('\n'),
                option_values: optionValues,
              })

              if (price < starting_price) {
                starting_price = price
              }
            }

            mappedObject.options = Array.from(uniqueOptions)
          }

          delete mappedObject.raffles

          mappedObject['starting_price'] =
            starting_price === Number.POSITIVE_INFINITY ? 0 : starting_price
        }

        if (isRaffle) {
          let rank = 1
          const rafflePrizes = []

          for (const product of products) {
            const prizeImages = product[dealKeys.prize_images].split('\n')

            rafflePrizes.push({
              rank: rank++,
              name: product[dealKeys.prize_title],
              number_of_winners: parseInt(product[dealKeys.total_prize_winner]),
              images: prizeImages,
            })
          }

          mappedObject.raffles = {
            donation_rules: products[0][dealKeys.rules],
            price_details: products[0][dealKeys.prize_details],
            donation_reason: products[0][dealKeys.raffle_why_donate],
            winner_announcement_date: new Date(products[0][dealKeys.winner_drawn_date]),
            raffle_prizes: rafflePrizes,
          }

          delete mappedObject.variants
          delete mappedObject.options
        }

        mappedDeals.push(mappedObject)
      }
    }

    if (!shippingProfile) {
      for (const dealItem of mappedDeals) {
        if (!dealItem.shipping_fee || !dealItem.shipping_method || !dealItem.sender_location) {
          return HandleErrors(new PreconditionFailedException(ErrorKey.MISSING_SHIPPING_PROFILE))
        }
      }
    }

    const batchSize = 10

    for (let i = 0; i < mappedDeals.length; i += batchSize) {
      const deals = mappedDeals.slice(i, i + batchSize)

      for (const dealItem of deals) {
        if (dealItem.donation_nonprofit) {
          dealItem.donation_nonprofit = await this.entityManager
            .createQueryBuilder()
            .select('nonprofit_users.id', 'id')
            .from('nonprofit_users', 'nonprofit_users')
            .innerJoin('nonprofit_users.profile', 'nonprofit_profiles')
            .where('nonprofit_profiles.foundation_name = :foundationName', {
              foundationName: dealItem.donation_nonprofit,
            })
            .getRawOne()
        }

        if (dealItem.donation_project) {
          dealItem.donation_project = await this.entityManager.findOneOrFail('donation_projects', {
            where: {
              name: dealItem.donation_project,
            },
            select: ['id'],
          })
        }

        if (dealItem.shipping_method) {
          dealItem.shipping_method = await this.entityManager
            .createQueryBuilder()
            .select('sm.id', 'id')
            .addSelect('lc.name', 'name')
            .from('shipping_methods', 'sm')
            .innerJoin(
              (qb) => {
                return qb
                  .select('smt."shippingMethodId"', 'shippingMethodId')
                  .addSelect('smt."name"', 'name')
                  .from('shipping_method_translations', 'smt')
                  .innerJoin('region_settings', 'rs', 'rs.name = :name', { name: 'LANGUAGE' })
                  .innerJoin(
                    'languages',
                    'l',
                    'l."code" = rs.value->>\'value\' AND l.id = smt."languageId"',
                  )
                  .where('smt.name = :shippingMethodName', {
                    shippingMethodName: dealItem.shipping_method,
                  })
              },
              'lc',
              'sm.id = "lc"."shippingMethodId"',
            )
            .getRawOne()
        }

        dealItem.brand = await this.entityManager.findOneOrFail('brands', {
          where: {
            name: dealItem.brand,
          },
          select: ['id'],
        })

        let smallCategory = null
        let middleCategory = null

        const bigCategory = await this.entityManager.findOneOrFail('deal_categories', {
          where: {
            name: dealItem.category_big,
            parent: IsNull(),
            type: DealCategoryType.BIG,
          },
          select: ['id'],
        })

        if (dealItem.category_middle) {
          middleCategory = await this.entityManager.findOneOrFail('deal_categories', {
            where: {
              name: dealItem.category_middle,
              parent: {
                id: bigCategory.id,
              },
              type: DealCategoryType.MIDDLE,
            },
            select: ['id'],
          })
        }

        if (middleCategory && dealItem.category_small) {
          smallCategory = await this.entityManager.findOneOrFail('deal_categories', {
            where: {
              name: dealItem.category_small,
              parent: {
                id: middleCategory.id,
              },
              type: DealCategoryType.SMALL,
            },
            select: ['id'],
          })
        }

        if (!middleCategory) {
          dealItem.category = bigCategory
        } else if (middleCategory && !smallCategory) {
          dealItem.category = middleCategory
        } else {
          dealItem.category = smallCategory
        }

        delete dealItem.category_big
        delete dealItem.category_middle
        delete dealItem.category_small

        if (dealItem.deal_type === DealType.AUCTION && dealItem.shipping_fee) {
          dealItem.shipping_fee = [
            {
              min_amount: 1,
              fee: dealItem.shipping_fee,
            },
          ]
        }

        if (!shippingProfile) {
          const shippingFee = JSON.parse(dealItem.shipping_fee)

          await validateShippingFees(shippingFee)
        }

        if (
          dealItem.deal_type === DealType.AUCTION &&
          dealItem.images &&
          dealItem.images.includes('\n')
        ) {
          const images = dealItem.images.split('\n')

          dealItem.images = await Promise.all(
            images.map(async (image) => {
              return await this.entityManager.findOne('images', {
                where: {
                  url: image,
                  section: UploadType.DEAL,
                },
                select: ['id'],
              })
            }),
          )

          if (dealItem.images.length) {
            for (let i = 0; i < dealItem.images.length; i++) {
              await this.entityManager.update('images', dealItem.images[i].id, {
                is_featured: i === 0 ? true : false,
              })
            }
          }
        }

        const variants = []
        const rafflePrizes = []

        if (dealItem.variants && dealItem.deal_type === DealType.BUYNOW) {
          await Promise.all(
            dealItem.variants.map(async (variant) => {
              const images = await this.entityManager.find('images', {
                where: {
                  url: In(variant.images),
                  section: UploadType.DEAL,
                },
                select: ['id'],
              })

              variants.push({
                ...variant,
                images,
              })
            }),
          )

          dealItem.variants = variants
        } else {
          delete dealItem.variants
          delete dealItem.options
        }

        if (dealItem.raffles && dealItem.deal_type === DealType.RAFFLE) {
          await Promise.all(
            dealItem.raffles.raffle_prizes.map(async (rafflePrize) => {
              const images = await this.imagesService.findMany({
                where: {
                  url: In(rafflePrize.images),
                  section: UploadType.DEAL,
                },
                select: ['id'],
              })

              rafflePrizes.push({
                ...rafflePrize,
                images,
              })
            }),
          )

          dealItem.raffles = {
            ...dealItem.raffles,
            raffle_prizes: rafflePrizes,
          }
        }

        await this.updateOne({
          ...dealItem,
          user: {
            id: userId,
          },
        })
      }
    }

    return {
      success: true,
      message: 'Deals successfully imported.',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
