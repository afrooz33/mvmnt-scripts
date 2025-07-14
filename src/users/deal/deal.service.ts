import { Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { BadRequestException, Injectable } from '@nestjs/common'
import { MyService } from '@app/src/shared/base'
import { ErrorKey } from '@app/src/shared/enums'
import { BullMqQuery } from '@app/src/shared/constant'
import DonationHelper from '@app/src/shared/helpers/Donation.helper'
import { MailService } from '@app/src/mail/mail.service'
import { ImagesService } from '@app/src/images/images.service'
import { UserService } from '@app/src/users/user/user.service'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { SystemFeeService } from '@app/src/admin/system-fee/system-fee.service'
import { TaskSchedulerService } from '@app/src/task-scheduler/task-scheduler.service'
import { RestrictionsService } from '@app/src/users/restrictions/restrictions.service'
import { RegionSettingsService } from '@app/src/admin/region-settings/region_settings.service'
import { ProductTagService } from '@app/src/users/delivery-settings/product-tag/product-tag.service'
import { ShippingProfileEntity } from '@app/src/users/shipping-profiles/entities/shipping-profiles.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { DealType } from './enums'
import { DealEntity } from './entities/deal.entity'
import { DealCategoryService } from './category/category.service'
import { DealVariantEntity } from './entities/deal-variant.entity'
import { VariantOptionService } from './variant-option/variant-option.service'
import { DealVariantInventoryEntity } from './entities/deal-variant-inventory.entity'
import {
  showService,
  importService,
  createService,
  deleteService,
  getOneService,
  listAllService,
  duplicateService,
  deleteManyService,
  prePurchaseService,
  getVariantIdService,
  changeStatusService,
  modifyQuantityService,
  deleteRaffleDealService,
  nonprofitByGenreService,
  deleteBuyNowDealService,
  deleteAuctionDealService,
  showEditableInventoryService,
  getApplicableInventoryService,
  applicableShippingOriginService,
} from './services'

@Injectable()
export class DealService extends MyService<DealEntity> {
  constructor(
    @InjectRepository(DealEntity)
    private readonly dealRepository: Repository<DealEntity>,
    @InjectRepository(DealVariantEntity)
    private readonly dealVariantRepository: Repository<DealVariantEntity>,
    @InjectRepository(DonationProjectEntity)
    private readonly donationProjectRepository: Repository<DonationProjectEntity>,
    private readonly imagesService: ImagesService,
    private readonly variantOptionService: VariantOptionService,
    private readonly userService: UserService,
    @InjectQueue(BullMqQuery.USER_DEAL_QUEUE)
    private readonly dealQueue: Queue,
    private readonly taskSchedulerService: TaskSchedulerService,
    private readonly restrictionService: RestrictionsService,
    private readonly mailService: MailService,
    private readonly regionSettingsService: RegionSettingsService,
    private readonly entityManager: EntityManager,
    @InjectRepository(ShippingProfileEntity)
    private readonly shippingProfileRepository: ShippingProfileEntity,
    private readonly productTagService: ProductTagService,
    @InjectRepository(DealVariantInventoryEntity)
    private dealVariantInventoryRepository: Repository<DealVariantInventoryEntity>,
    private readonly systemFeeService: SystemFeeService,
    private readonly eventEmitter: EventEmitter2,
    private readonly dealCatalogService: DealCategoryService,
    private readonly tokensService: TokensService,
    private readonly userPointsService: UserPointsService,
  ) {
    super(dealRepository, 'deals')
  }

  show = showService.bind(this)
  create = createService.bind(this)
  delete = deleteService.bind(this)
  import = importService.bind(this)
  getOne = getOneService.bind(this)
  listAll = listAllService.bind(this)
  duplicate = duplicateService.bind(this)
  deleteMany = deleteManyService.bind(this)
  prePurchase = prePurchaseService.bind(this)
  getVariantId = getVariantIdService.bind(this)
  changeStatus = changeStatusService.bind(this)

  modifyQuantity = modifyQuantityService.bind(this)
  deleteRaffleDeal = deleteRaffleDealService.bind(this)
  deleteBuyNowDeal = deleteBuyNowDealService.bind(this)
  deleteAuctionDeal = deleteAuctionDealService.bind(this)

  /**
   * Checks if the editable inventory should be shown for a deal variant.
   *
   * @param {string} id - Deal variant
   * @param {string} userId - User ID
   * @return {Promise<{ shouldShow: boolean; origins: any[] }>} - An object containing the shouldShow flag and the origins array
   */
  showEditableInventory = showEditableInventoryService.bind(this)

  /**
   * Retrieves applicable inventory for a deal variant.
   *
   * @param {string} dealId - Deal ID
   * @param {string} variantId - Variant ID
   * @return {Promise<any>} - The applicable inventory data
   */
  getApplicableInventory = getApplicableInventoryService.bind(this)

  /**
   * Retrieves applicable shipping origin for a deal variant.
   *
   * @param {string} dealId - Deal ID
   * @query {string} variantId - Variant ID
   * @return {Promise<any>} - The applicable shipping origin
   */
  applicableShippingOrigin = applicableShippingOriginService.bind(this)

  /**
   * Select the nonprofit by genre
   *
   * @query {string} genre - Genre of the nonprofit
   * @return {Promise<any>} - The nonprofit
   */
  nonprofitByGenre = nonprofitByGenreService.bind(this)

  /**
   * Validates the donation amount for the given deal type
   *
   * @param {object} payload - Deal payload
   * @param {object} user - User object
   * @param {object} systemFee - System fee object
   *
   * @return {Promise<void>} - Resolves if the donation amount is valid, throws an error otherwise
   */
  async validateDonationAmount(payload: any, user: any, systemFee: any): Promise<void> {
    let totalAmount = 0

    // Calculate total amount for AUCTION or RAFFLE
    if (payload.deal_type === DealType.AUCTION || payload.deal_type === DealType.RAFFLE) {
      totalAmount = payload.starting_price || 0
    }

    // Calculate total amount for BUYNOW
    if (payload.deal_type === DealType.BUYNOW && payload.variants.length) {
      for (const variant of payload.variants) {
        const variantTotalAmount = variant.price * (variant.quantity || 1)
        const donationResult = await DonationHelper(
          payload as any,
          systemFee,
          user,
          variantTotalAmount,
          1,
          false,
          payload.variants,
        )

        // Check if donation is valid for this variant
        if (!donationResult.isValid) {
          throw new BadRequestException(ErrorKey.INVALID_DONATION_AMOUNT)
        }
      }
    } else {
      // Call DonationHelper with the calculated totalAmount
      const donationResult = await DonationHelper(
        payload as any,
        systemFee,
        user,
        totalAmount,
        1,
        false,
      )

      // Check if donation is valid
      if (!donationResult.isValid) {
        throw new BadRequestException(ErrorKey.INVALID_DONATION_AMOUNT)
      }
    }
  }

  /**
   * Validates the Reselling settings for the given deal type.
   * Reselling settings are only allowed for BUYNOW deals or deals with multiple variants.
   * This ensures that reselling is only enabled for appropriate deal types and configurations.
   *
   * @param {object} payload - Deal payload
   * @throws {BadRequestException} If Reselling settings are set for invalid deal types or variant configurations
   */
  async validateResellingSettings(payload): Promise<void> {
    const hasSingleVariant = payload.variants?.length < 2
    const isNotBuyNow = payload.deal_type !== DealType.BUYNOW
    const hasResellingSettings =
      payload.allow_reselling ||
      payload.reselling_amount_type ||
      payload.reselling_fee ||
      payload.reselling_cap ||
      payload.reselling_cap_value

    if (isNotBuyNow && hasResellingSettings && hasSingleVariant) {
      throw new BadRequestException(ErrorKey.RESELLING_SETTINGS_NOT_ALLOWED)
    }
  }

  /**
   * Validates the inventory for each variant of a deal.
   * When is_default is true, each variant's inventory must contain exactly one object and no origin property.
   * When is_default is false, each variant's inventory may have multiple objects, but each must have a valid origin.
   * @param {{ variants: any[] }} payload - Deal payload
   * @param {{ success: boolean; is_default: boolean; origin: string | string[] }} inventoryResponse - Inventory response from applicableShippingOrigin
   * @throws {Error} If inventory is invalid
   * @returns {Promise<boolean>} True if validation passes
   */
  async validateBuynowVariantPayload(
    payload: any,
    inventoryResponse: { success: boolean; is_default: boolean; origin: string | string[] },
  ) {
    try {
      const { variants } = payload
      const { is_default, origin } = inventoryResponse

      for (const variant of variants) {
        const { inventory } = variant

        if (!Array.isArray(inventory) || inventory.length === 0) {
          throw new Error(ErrorKey.VARIANT_INVENTORY_REQUIRED)
        }

        for (const item of inventory) {
          if (Number.parseInt(item.quantity) <= 0) {
            throw new Error(ErrorKey.INVALID_INVENTORY_QUANTITY)
          }
        }

        if (is_default) {
          if (inventory.length !== 1) {
            throw new Error(ErrorKey.INVALID_VARIANT_INVENTORY)
          }

          const inventoryItem = inventory[0]

          if (!inventoryItem.origin || inventoryItem.origin !== origin) {
            throw new Error(ErrorKey.INVALID_DEFAULT_SHIPPING_ORIGIN)
          }
        } else {
          if (!Array.isArray(origin)) {
            throw new Error(ErrorKey.INVALID_SHIPPING_ORIGIN)
          }

          for (const inventoryItem of inventory) {
            if (!inventoryItem.origin || !origin.includes(inventoryItem.origin)) {
              throw new Error(ErrorKey.INVENTORY_SHIPPING_ORIGIN_MISMATCH)
            }
          }
        }
      }

      return true
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }
}
