import { In, Not, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, PreconditionFailedException } from '@nestjs/common'
import { MyService } from '@app/src/shared/base'
import { ErrorKey } from '@app/src/shared/enums'
import { AccountStatus } from '@app/src/re2/user/enums'
import { UserService } from '@app/src/re2/user/user.service'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { NonprofitUserService } from '@app/src/nonprofit/user/nonprofit-user.service'
import { AccountStatus as NonprofitAccountStatus } from '@app/src/nonprofit/user/enums'
import { DonationProjectsService } from '@app/src/nonprofit/donation-projects/donation-projects.service'
import { IntegrationStatus } from './enums'
import { IntegrationsEntity } from './entities/integrations.entity'
import { ShopifyIntegrationsEntity } from './entities/shopify-integration.entity'
import { ShopifyCartBannerSettingEntity } from './entities/shopify-cart-banner-settings.entity'
import { ShopifyCartDrawerSettingEntity } from './entities/shopify-cart-drawer-settings.entity'
import { ShopifySalePortionSettingEntity } from './entities/shopify-sale-portion-settings.entity'
import {
  showService,
  createService,
  deleteService,
  appInstalledService,
  changeStatusService,
  deleteSettingService,
  filterResourceService,
  cloneSettingsService,
  shopifySettingService,
  showCartDrawerService,
  showCartBannerService,
  showSalePortionService,
  preChangeStatusService,
  createCartDrawerService,
  updateCartDrawerService,
  updateCartBannerService,
  createCartBannerService,
  createSalePortionService,
  updateSalePortionService,
  showOneCartBannerService,
  showOneCartDrawerService,
  showOneSalePortionService,
} from './services'

@Injectable()
export class IntegrationsService extends MyService<IntegrationsEntity> {
  constructor(
    @InjectRepository(IntegrationsEntity)
    private readonly integrationsRepository: Repository<IntegrationsEntity>,
    @InjectRepository(ShopifyIntegrationsEntity)
    private readonly shopifyIntegrationsRepository: Repository<ShopifyIntegrationsEntity>,
    @InjectRepository(ShopifySalePortionSettingEntity)
    private readonly shopifySalePortionSettingRepository: Repository<ShopifySalePortionSettingEntity>,
    @InjectRepository(ShopifyCartBannerSettingEntity)
    private readonly shopifyCartBannerSettingRepository: Repository<ShopifyCartBannerSettingEntity>,
    @InjectRepository(ShopifyCartDrawerSettingEntity)
    private readonly shopifyCartDrawerSettingRepository: Repository<ShopifyCartDrawerSettingEntity>,
    private readonly userService: UserService,
    private readonly nonprofitUserService: NonprofitUserService,
    private readonly donationProjectsService: DonationProjectsService,
  ) {
    super(integrationsRepository, 're2/integrations')
  }

  /**
   * Checks if a given Shopify ID is in use.
   *
   * @param {string} id - The Shopify ID to check.
   * @param {'products' | 'collections' | 'variants'} idType - The type of Shopify ID.
   * @return {Promise<boolean>} A Promise that resolves to a boolean indicating whether the ID is in use.
   */
  async isShopifyIdInUse(
    id: string,
    value: string,
    idType: 'products' | 'collections' | 'variants',
  ): Promise<boolean> {
    const settingsCount = await this.shopifySalePortionSettingRepository
      .createQueryBuilder('re2_shopify_sale_portion_settings')
      .where(`:value = ANY (re2_shopify_sale_portion_settings.shopify_${idType})`, { value })
      .andWhere(`re2_shopify_sale_portion_settings.id != :id`, { id })
      .getCount()

    return settingsCount > 0
  }

  /**
   * Validate user and integration before creating settings
   * @param id Integration ID
   * @param shopifyIntegrationId Shopify Integration ID
   * @param userId User ID
   * @returns
   * @throws PreconditionFailedException
   */
  async validateUserAndIntegration(
    id: string,
    shopifyIntegrationId: string,
    userId: string,
  ): Promise<any> {
    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ACTIVE,
          },
          select: ['id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.RE2_NOT_FOUND,
        args: { id: userId },
      }),
    })

    const integration = await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: {
              id: userId,
            },
            status: Not(IntegrationStatus.DELETED),
          },
          select: ['id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.RE2_INTEGRATION_NOT_FOUND,
        args: { id },
      }),
    })

    const shopify_integration = await this.shopifyIntegrationsRepository.findOne({
      where: {
        id: shopifyIntegrationId,
        integration: integration,
      },
    })

    if (!shopify_integration) {
      throw new PreconditionFailedException(ErrorKey.RE2_SALE_PORTION_SETTINGS_NOT_FOUND)
    }

    return {
      user,
      shopify_integration,
    }
  }

  /**
   * Validate nonprofits before creating settings
   * @param payload
   * @returns
   * @throws PreconditionFailedException
   */
  async validateNonprofits(payload: any): Promise<any> {
    let nonprofits = []

    if (payload.nonprofits && payload.nonprofits.length) {
      nonprofits = await this.nonprofitUserService.findMany({
        where: {
          id: In(payload.nonprofits),
          account_status: NonprofitAccountStatus.ACTIVE,
        },
      })

      if (nonprofits.length !== payload.nonprofits.length) {
        throw new PreconditionFailedException(ErrorKey.INVALID_FUNDRAISER_NONPROFIT)
      }
    }

    return nonprofits
  }

  /**
   * Validate donation projects before creating settings
   * @param payload
   * @returns
   * @throws PreconditionFailedException
   */
  async validateDonationProjects(payload: any): Promise<any> {
    let donation_projects = []

    if (payload.donation_projects && payload.donation_projects.length) {
      donation_projects = await this.donationProjectsService.findMany({
        where: {
          id: In(payload.donation_projects),
          status: In([DonationProjectStatus.ENDED, DonationProjectStatus.PUBLISHED]),
        },
      })

      if (donation_projects.length !== payload.donation_projects.length) {
        throw new PreconditionFailedException(ErrorKey.INVALID_FUNDRAISER_DONATION_PROJECT)
      }
    }

    return donation_projects
  }

  /**
   * Validate shopify products variant and collection before creating settings
   */
  async validateShopifyPayload(payload: any): Promise<any> {
    if (
      (!payload.shopify_products || payload.shopify_products.length === 0) &&
      (!payload.shopify_collections || payload.shopify_collections.length === 0) &&
      (!payload.shopify_variants || payload.shopify_variants.length === 0)
    ) {
      throw new PreconditionFailedException('Invalid shopify products, collections or variants')
    }

    if (payload.shopify_products && payload.shopify_products.length > 0) {
      if (payload.shopify_collections && payload.shopify_collections.length > 0) {
        throw new PreconditionFailedException('Invalid shopify products, collections or variants')
      }

      if (payload.shopify_variants && payload.shopify_variants.length > 0) {
        throw new PreconditionFailedException('Invalid shopify products, collections or variants')
      }
    }

    if (payload.shopify_collections && payload.shopify_collections.length > 0) {
      if (payload.shopify_products && payload.shopify_products.length > 0) {
        throw new PreconditionFailedException('Invalid shopify products, collections or variants')
      }

      if (payload.shopify_variants && payload.shopify_variants.length > 0) {
        throw new PreconditionFailedException('Invalid shopify products, collections or variants')
      }
    }

    if (payload.shopify_variants && payload.shopify_variants.length > 0) {
      if (payload.shopify_products && payload.shopify_products.length > 0) {
        throw new PreconditionFailedException('Invalid shopify products, collections or variants')
      }

      if (payload.shopify_collections && payload.shopify_collections.length > 0) {
        throw new PreconditionFailedException('Invalid shopify products, collections or variants')
      }
    }
  }

  show = showService.bind(this)
  create = createService.bind(this)
  delete = deleteService.bind(this)
  changeStatus = changeStatusService.bind(this)
  cloneSettings = cloneSettingsService.bind(this)
  deleteSetting = deleteSettingService.bind(this)
  showCartBanner = showCartBannerService.bind(this)
  showCartDrawer = showCartDrawerService.bind(this)
  preChangeStatus = preChangeStatusService.bind(this)
  showSalePortion = showSalePortionService.bind(this)
  createCartDrawer = createCartDrawerService.bind(this)
  updateCartDrawer = updateCartDrawerService.bind(this)
  createCartBanner = createCartBannerService.bind(this)
  updateCartBanner = updateCartBannerService.bind(this)
  createSalePortion = createSalePortionService.bind(this)
  updateSalePortion = updateSalePortionService.bind(this)
  showOneCartBanner = showOneCartBannerService.bind(this)
  showOneCartDrawer = showOneCartDrawerService.bind(this)
  showOneSalePortion = showOneSalePortionService.bind(this)

  /**
   * Service code for shopify app
   */
  appInstalled = appInstalledService.bind(this)
  filterResource = filterResourceService.bind(this)
  shopifySetting = shopifySettingService.bind(this)
}
