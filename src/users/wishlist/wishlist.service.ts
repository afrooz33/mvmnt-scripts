import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { IEventEmitter } from '@app/src/shared/interfaces'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UserService } from '@app/src/users/user/user.service'
import { ImagesService } from '@app/src/images/images.service'
import { TagsService } from '@app/src/admin/tags/tags.service'
import { AddressService } from '@app/src/users/address/address.service'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { WishlistEntity } from './entities/wishlist.entity'
import {
  showService,
  moveService,
  createService,
  deleteService,
  showOneService,
  reorderService,
  addToListService,
  showItemsService,
  addDetailsService,
  publicListService,
  createDefaultService,
  publicRankingService,
  updateWishlistService,
  publicListItemsService,
  variantWishlistsService,
  publicGetWishlistService,
  publicWishlistDetailService,
  publicPurchaseHistoryService,
} from './services'
import { WishlistVariantEntity } from './entities/wishlist-variant.entity'

@Injectable()
export class WishlistService extends MyService<WishlistEntity> {
  constructor(
    @InjectRepository(WishlistEntity)
    private readonly wishlistRepository: Repository<WishlistEntity>,
    @InjectRepository(DealVariantEntity)
    private readonly dealVariantRepository: Repository<DealVariantEntity>,
    @InjectRepository(WishlistVariantEntity)
    private readonly wishlistVariantRepository: Repository<WishlistVariantEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    @InjectRepository(BuynowCartEntity)
    private readonly cartRepository: Repository<BuynowCartEntity>,
    private readonly userService: UserService,
    private readonly imagesService: ImagesService,
    private readonly tagsService: TagsService,
    private readonly addressService: AddressService,
  ) {
    super(wishlistRepository, 'user/wishlist')
  }

  show = showService.bind(this)
  move = moveService.bind(this)
  create = createService.bind(this)
  delete = deleteService.bind(this)
  reorder = reorderService.bind(this)
  showOne = showOneService.bind(this)
  showItems = showItemsService.bind(this)
  addToList = addToListService.bind(this)
  addDetails = addDetailsService.bind(this)
  createDefault = createDefaultService.bind(this)
  updateWishlist = updateWishlistService.bind(this)

  /**
   * All public wishlist api
   */

  publicList = publicListService.bind(this)
  publicRanking = publicRankingService.bind(this)
  publicListItems = publicListItemsService.bind(this)
  variantWishlists = variantWishlistsService.bind(this)
  publicGetWishlist = publicGetWishlistService.bind(this)
  publicWishlistDetail = publicWishlistDetailService.bind(this)
  publicPurchaseHistory = publicPurchaseHistoryService.bind(this)

  /**
   * @description code to handle custom events
   */
  @OnEvent('user.signup')
  async setDefaultWishlist(event: IEventEmitter): Promise<void> {
    try {
      await this.createDefault(event['id'])
    } catch (error) {
      return HandleErrors(error)
    }
  }
}
