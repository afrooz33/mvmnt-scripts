import { In } from 'typeorm'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'

export default async function (arg) {
  let variants = []
  let searchCondition = {}

  const deal = arg?.deal

  if (deal) {
    searchCondition = {
      deal: {
        id: deal,
      },
    }
  }

  variants = await this.entityManager.find('deal_variants', {
    where: searchCondition,
    relations: ['deal', 'deal.user'],
  })

  for (const variant of variants) {
    try {
      let applicableProfile

      applicableProfile = await this.entityManager.findOne('shipping_profiles', {
        where: {
          all_deals: false,
          status: ShippingProfileStatus.ENABLED,
          user: {
            id: variant.deal.user.id,
          },
          variants: {
            id: variant.id,
          },
        },
        relations: ['origins'],
      })

      if (!applicableProfile) {
        applicableProfile = await this.entityManager.findOne('shipping_profiles', {
          where: {
            all_deals: false,
            status: ShippingProfileStatus.ENABLED,
            user: {
              id: variant.deal.user.id,
            },
            deals: {
              id: variant.deal.id,
            },
          },
          relations: ['origins'],
        })
      }

      if (!applicableProfile) {
        applicableProfile = await this.entityManager.findOne('shipping_profiles', {
          where: {
            status: In([ShippingProfileStatus.ENABLED, ShippingProfileStatus.DEFAULT]),
            user: {
              id: variant.deal.user.id,
            },
          },
          relations: ['origins'],
        })
      }

      if (applicableProfile?.origins?.length) {
        await Promise.all(
          applicableProfile.origins.map(async (origin) => {
            const inventory = await this.entityManager.findOne('deal_variant_inventory', {
              where: {
                variant: {
                  id: variant.id,
                },
                origin: {
                  id: origin.id,
                },
              },
              select: ['id'],
            })

            if (!inventory) {
              await this.entityManager.save('deal_variant_inventory', {
                variant: {
                  id: variant.id,
                },
                origin: {
                  id: origin.id,
                },
                quantity: 50,
              })
            }
          }),
        )
      }
    } catch (error) {
      console.error('Error processing variant', variant.id, error)
    }
  }
}
