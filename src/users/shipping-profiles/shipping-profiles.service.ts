import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, ILike, In, Not, Repository } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { DefaultAddress } from '@app/src/shared/constant'
import { IEventEmitter } from '@app/src/shared/interfaces'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'
import { GeoService } from '@app/src/admin/geo/geo.service'
import { DealService } from '@app/src/users/deal/deal.service'
import { UserService } from '@app/src/users/user/user.service'
import { UserAddressStatus } from '@app/src/users/address/enums'
import { AddressService } from '@app/src/users/address/address.service'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { DealVariantInventoryEntity } from '@app/src/users/deal/entities/deal-variant-inventory.entity'
import { ShippingProfileStatus } from './enums'
import { UpdateShippingProfileDto } from './dto'
import { VariantOriginData } from './interfaces'
import { ShippingProfileEntity } from './entities/shipping-profiles.entity'
import {
  showService,
  createService,
  deleteService,
  updateService,
  showOneService,
  getDealsService,
  showZonesService,
  getOriginsService,
  applicableToDealService,
} from './services'
import { ShippingPriceEntity } from './entities/shipping-prices.entity'
import { ShippingZoneEntity } from './entities/shipping-zones.entity'
import { ShippingZoneCountriesEntity } from './entities/shipping-zone-countries.entity'

@Injectable()
export class ShippingProfilesService extends MyService<ShippingProfileEntity> {
  constructor(
    @InjectRepository(ShippingProfileEntity)
    private readonly shippingProfileRepository: Repository<ShippingProfileEntity>,
    @InjectRepository(DealVariantEntity)
    private readonly dealVariantRepository: Repository<DealVariantEntity>,
    @InjectRepository(ShippingPriceEntity)
    private readonly shippingPriceRepository: Repository<ShippingPriceEntity>,
    @InjectRepository(ShippingZoneEntity)
    private readonly shippingZoneRepository: Repository<ShippingZoneEntity>,
    @InjectRepository(DealVariantInventoryEntity)
    private dealVariantInventoryRepository: Repository<DealVariantInventoryEntity>,
    @InjectRepository(ShippingZoneCountriesEntity)
    private readonly shippingZoneCountriesRepository: Repository<ShippingZoneCountriesEntity>,
    private readonly addressService: AddressService,
    private readonly dealService: DealService,
    private readonly geoService: GeoService,
    private readonly userService: UserService,
    private readonly entityManager: EntityManager,
  ) {
    super(shippingProfileRepository, 'users/shipping-profiles')
  }

  show = showService.bind(this)
  update = updateService.bind(this)
  create = createService.bind(this)
  delete = deleteService.bind(this)
  showOne = showOneService.bind(this)
  getDeals = getDealsService.bind(this)
  showZones = showZonesService.bind(this)
  getOrigins = getOriginsService.bind(this)
  applicableToDeal = applicableToDealService.bind(this)

  /**
   * @desc: Validate if shipping profile is allowed to be created
   * @param: userId (string)
   * @param: payload (Partial<UpdateShippingProfileDto>)
   * @returns: Promise<boolean>
   */
  async isShippingProfileValid(
    userId: string,
    payload: Partial<UpdateShippingProfileDto>,
  ): Promise<boolean> {
    try {
      let sql = `SELECT
          COUNT(*)::int
        FROM
          "shipping_profile_origins" "spo"
        LEFT JOIN "shipping_profiles" "sp" ON "sp"."id" = "spo"."shippingProfilesId"
        LEFT JOIN "shipping_profile_variants" "spv" ON "spv"."shippingProfilesId" = "sp"."id"
        LEFT JOIN "shipping_profile_deals" "spd" ON "spd"."shippingProfilesId" = "sp"."id"
        WHERE
          "sp"."userId" = '${userId}' AND "sp"."status" = '${ShippingProfileStatus.ENABLED}'`

      if (payload?.id) {
        sql += ` AND "sp"."id" != '${payload.id}'`
      }

      if (payload.all_deals) {
        sql += ' AND "sp"."all_deals" = true'
      }

      if (payload.deals?.length) {
        sql += ` AND "spd"."dealsId" IN (${payload.deals
          .map((deal: any) => `'${deal.id || deal}'`)
          .join(',')})`
      }

      if (payload.variants?.length) {
        sql += ` AND "sp"."all_deals" = false AND "spv"."dealVariantsId" IN (${payload.variants
          .map((variant: any) => `'${variant.id || variant}'`)
          .join(',')})`
      }

      if (payload.origins?.length) {
        sql += ` AND "spo"."userAddressessId" IN (${payload.origins
          .map((origin: any) => `'${origin.id || origin}'`)
          .join(',')})`
      }

      const result = await this.entityManager.query(sql)

      return result[0].count === 0
    } catch (error) {
      return HandleErrors(error)
    }
  }

  /**
   * @desc: Modify deal variants quantity based on shipping profile and its origin
   * @param: userId (string)
   * @param: payload (Partial<UpdateShippingProfileDto>)
   * @returns: Promise<Number>
   */
  async updateDealVariantsQuantity(
    userId: string,
    payload: Partial<UpdateShippingProfileDto>,
  ): Promise<number> {
    try {
      const variants = new Set()

      if (payload?.deals?.length) {
        const deals = await this.dealService.findMany({
          where: {
            id: In(payload.deals),
            user: { id: userId },
            status: Not(DealStatus.DELETED),
          },
          select: ['id', 'variants.id'],
          relations: ['variants'],
        })

        for (const deal of deals) {
          for (const variant of deal.variants) {
            variants.add(variant.id)
          }
        }
      }

      if (payload?.variants?.length) {
        for (const variant of payload.variants) {
          variants.add(variant)
        }
      }

      if (payload.all_deals) {
        const deals = await this.dealService.findMany({
          where: {
            user: { id: userId },
            status: Not(DealStatus.DELETED),
          },
          select: ['id', 'variants.id'],
          relations: ['variants'],
        })

        for (const deal of deals) {
          for (const variant of deal.variants) {
            variants.add(variant.id)
          }
        }
      }

      const data: VariantOriginData = {
        variants: Array.from(variants) as string[],
        origins: payload.origins,
      }

      const allCombinations = data.variants.flatMap((variant) =>
        data.origins.map((origin) => ({ variant, origin })),
      )

      const existingRecords = await this.dealVariantInventoryRepository
        .createQueryBuilder('dvi')
        .select(['dvi.id', 'variant.id', 'origin.id'])
        .innerJoin('dvi.variant', 'variant')
        .innerJoin('dvi.origin', 'origin')
        .where('variant.id IN (:...variants) AND origin.id IN (:...origins)', {
          variants: data.variants,
          origins: data.origins,
        })
        .getMany()

      const existingPairs = existingRecords.map((record) => ({
        variant: record.variant.id,
        origin: record.origin.id,
      }))

      const missingPairs = allCombinations.filter(
        (pair) =>
          !existingPairs.some(
            (existing: any) => existing.variant === pair.variant && existing.origin === pair.origin,
          ),
      )

      const recordsToInsert = missingPairs.map((pair) => ({
        ...pair,
        quantity: 0,
        variant: { id: pair.variant },
        origin: { id: pair.origin },
      }))

      if (recordsToInsert.length) {
        await this.dealVariantInventoryRepository.insert(recordsToInsert)
      }

      return recordsToInsert.length
    } catch (error) {
      return HandleErrors(error)
    }
  }

  /**
   * @description code to handle custom events
   */
  @OnEvent('user.signup')
  async setDefaultShippingProfile(event: IEventEmitter): Promise<void> {
    try {
      const country = await this.addressService.countryRepository.findOneOrFail({
        where: { name: ILike(DefaultAddress.MVMNT_ADDRESS_COUNTRY) },
        select: ['id'],
      })

      const profile = await this.addressService.profileRepository.save({
        user: {
          id: event['id'],
        },
      })

      const postcode = await this.geoService.postcodeRepository.find({
        select: ['id'],
        take: 1,
      })

      const defaultOrigin = await this.addressService.updateOne({
        city: DefaultAddress.MVMNT_ADDRESS_CITY,
        street: DefaultAddress.MVMNT_ADDRESS_STREET,
        postcode,
        state: DefaultAddress.MVMNT_ADDRESS_PREFECTURE,
        profile: {
          id: profile.id,
        },
        status: UserAddressStatus.SYSTEM_DEFAULT,
        country,
      })

      await this.shippingProfileRepository.save({
        user: {
          id: event['id'],
        },
        origin: {
          id: defaultOrigin.id,
        },
        all_deals: true,
        name: 'Default',
        status: ShippingProfileStatus.DEFAULT,
      })
    } catch (error) {
      return HandleErrors(error)
    }
  }
}
