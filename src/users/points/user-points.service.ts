import BigNumber from 'bignumber.js'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { In, LessThanOrEqual, MoreThan, Repository, EntityManager, Not, IsNull } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { MyService } from '@app/src/shared/base'
import { ErrorKey } from '@app/src/shared/enums'
import { UserAccountType } from '@app/src/users/user/enums'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { SystemFeeService } from '@app/src/admin/system-fee/system-fee.service'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { UserPointsEntity } from './entities/user-points.entity'
import { POINTS_STATUS, POINTS_REASON, POINTS_TYPE } from './enums'
import { BuyerSellerPoints, PointsInfo } from './interfaces/points.interface'
import { UserPointUpdatesEntity } from './entities/user-points-updates.entity'
import { UserPointRedemptionsEntity } from './entities/user-points-redemptions.entity'
import {
  POINTS_EXPIRY_DAYS,
  POINTS_DELIVERY_DAYS,
  POINT_RE2_TEMP_USER_EXPIRY_DAYS,
} from './constant/points.const'
import {
  pendingPointsService,
  pointsHistoryService,
  effectiveDateService,
  saveShopifyPointsService,
} from './services'
import getSystemFee from '@app/src/shared/helpers/SystemFee.helper'
import { getUserPoints } from './helper/rank-points.helper'
import { POINTS_DEAL } from './constant/points-rank.const'

@Injectable()
export class UserPointsService extends MyService<UserPointsEntity> {
  private REDEEMABLE_STATUSES = [POINTS_STATUS.DELIVERED, POINTS_STATUS.PARTIALLY_REDEEMED]

  private WITHDRAWABLE = [
    POINTS_STATUS.DELIVERED,
    POINTS_STATUS.PARTIALLY_REDEEMED,
    POINTS_STATUS.AWAITING_WITHDRAWAL,
  ]

  private readonly batchSize = 100
  private readonly deliverBatchSize = 1000
  private readonly expireBatchSize = 1000

  constructor(
    @InjectRepository(UserPointsEntity)
    private readonly userPointsRepository: Repository<UserPointsEntity>,

    @InjectRepository(UserPointUpdatesEntity)
    private readonly userPointUpdatesRepository: Repository<UserPointUpdatesEntity>,

    @InjectRepository(UserPointRedemptionsEntity)
    private readonly userPointRedemptionsRepository: Repository<UserPointRedemptionsEntity>,

    private readonly tokensService: TokensService,
    private readonly systemFeeService: SystemFeeService,
    private readonly entityManager: EntityManager,
  ) {
    super(userPointsRepository, 'user/points')
  }

  deliverPoints = async () => {
    while (true) {
      const pointsToDeliver = await this.userPointsRepository.find({
        where: {
          delivery_date: LessThanOrEqual(new Date()),
          status: In([POINTS_STATUS.UNLOCKED]),
        },
        select: ['id'],
        take: this.deliverBatchSize,
      })
      if (pointsToDeliver.length === 0) break

      const pointIds = []
      const pointUpdates: UserPointUpdatesEntity[] = []
      for (const point of pointsToDeliver) {
        pointIds.push(point.id)
        pointUpdates.push(
          this.userPointUpdatesRepository.create({
            status: POINTS_STATUS.DELIVERED,
            user_point: { id: point.id },
            notes: { reason: 'Delivered via CRON' },
          }),
        )
      }

      await this.entityManager.transaction(async (transaction) => {
        // Mark the entries as delivered
        await transaction.update(
          UserPointsEntity,
          { id: In(pointIds) },
          { status: POINTS_STATUS.DELIVERED },
        )
        // Create an update log
        await transaction.save(UserPointUpdatesEntity, pointUpdates)
      })
    }
  }

  expirePoints = async () => {
    while (true) {
      const pointsToExpire = await this.userPointsRepository.find({
        where: {
          expiry_date: LessThanOrEqual(new Date()),
          remaining: MoreThan(0),
          status: Not(In([POINTS_STATUS.REVERTED, POINTS_STATUS.REDEEMED, POINTS_STATUS.EXPIRED])),
        },
        take: this.expireBatchSize,
        select: ['id', 'remaining', 'status'],
      })

      if (pointsToExpire.length === 0) break

      const pointUpdates: UserPointUpdatesEntity[] = []
      for (const point of pointsToExpire) {
        pointUpdates.push(
          this.userPointUpdatesRepository.create({
            status: POINTS_STATUS.EXPIRED,
            user_point: { id: point.id },
            notes: { amount: point.remaining.toString(), reason: 'Expired' },
          }),
        )
        point.remaining = new BigNumber(0)
        point.status = POINTS_STATUS.EXPIRED
      }

      await this.entityManager.transaction(async (transaction) => {
        // Save updated status
        await transaction.save(UserPointsEntity, pointsToExpire)
        // Log the updates
        await transaction.save(UserPointUpdatesEntity, pointUpdates)
      })
    }
  }

  getUserPoints = async (userId: string): Promise<SuccessRO> => {
    const userPoints = await this.userPointsRepository
      .createQueryBuilder('up')
      .select(['tw.name AS "name"', 'tw.address AS "token"', 'SUM(up.amount) AS "points"'])
      .innerJoin('tokens_whitelist', 'tw', 'tw.id = up.withdrawCurrencyId')
      .where('up.userId = :userId', { userId })
      .andWhere('up.status IN (:...status)', { status: this.WITHDRAWABLE })
      .addGroupBy('tw.address')
      .addGroupBy('tw.name')
      .orderBy('tw.name')
      .getRawMany()

    return {
      success: true,
      message: 'User Points',
      data: userPoints,
    }
  }

  getAvailablePoints = async (userId: string, currencyId: string): Promise<BigNumber> => {
    const userPoints = await this.userPointsRepository
      .createQueryBuilder('points')
      .select('SUM(points.remaining)', 'total')
      .where(`points."userId" = :userId`, { userId })
      .andWhere(`points."withdrawCurrencyId" = :currencyId`, { currencyId })
      .andWhere('points.status IN (:...status)', { status: this.WITHDRAWABLE })
      .getRawOne()

    return new BigNumber(userPoints.total || 0)
  }

  getWithdrawablePoints = async (
    userId: string,
    currencyId: string,
    total: BigNumber,
  ): Promise<UserPointsEntity[]> => {
    const userPoints: UserPointsEntity[] = []
    let totalPoints: BigNumber = new BigNumber(0)
    let processComplete = false

    for (let pageNo = 0; ; pageNo += 1) {
      const points = await this.userPointsRepository.find({
        where: {
          user: { id: userId },
          withdraw_currency: { id: currencyId },
          status: In(this.WITHDRAWABLE),
          remaining: MoreThan(0),
        },
        skip: pageNo * this.batchSize,
        take: this.batchSize,
        order: { created: 'ASC' },
      })
      if (points.length === 0) {
        break
      }

      for (const point of points) {
        userPoints.push(point)
        totalPoints = totalPoints.plus(point.remaining)
        if (totalPoints.gte(total)) {
          processComplete = true
          break
        }
      }
      if (processComplete) break
    }
    return userPoints
  }

  getPointsDeliveryDate = () => {
    const now = new Date()
    now.setDate(now.getDate() + POINTS_DELIVERY_DAYS)
    return now
  }

  getPointsExpiryDate = (account_type?: UserAccountType | undefined) => {
    const now = new Date()
    if (account_type === UserAccountType.RE2_SHOPIFY_TEMP_USER) {
      now.setDate(now.getDate() + POINT_RE2_TEMP_USER_EXPIRY_DAYS)
    } else {
      now.setDate(now.getDate() + POINTS_EXPIRY_DAYS)
    }
    return now
  }

  calculateDonationPoints = (user: UserEntity, total: BigNumber): PointsInfo => {
    const redeemPoints = getUserPoints(total, user.rank)
    return {
      type: POINTS_TYPE.DONATION,
      amount: redeemPoints,
      delivery_date: new Date(),
      expiry_date: this.getPointsExpiryDate(user.account_type),
    }
  }

  calculateDealPoints = async (
    buyer: UserEntity,
    seller: UserEntity,
    deal: DealEntity,
    deal_amount: BigNumber,
  ): Promise<BuyerSellerPoints> => {
    // 1. Basic buyer/seller distribution
    const buyerRedeemPoints = deal_amount.multipliedBy(POINTS_DEAL[buyer.rank]).dividedBy(100)
    const sellerRedeemPoints = deal_amount.multipliedBy(POINTS_DEAL[seller.rank]).dividedBy(100)

    // 2. Delivery/Expiry
    const delivery_date = this.getPointsDeliveryDate()
    const expiry_date = this.getPointsExpiryDate(seller.account_type)

    // 3. System Fee portion for seller, so they get "deal_amount - systemFee" as points
    const allFees = await this.systemFeeService.findByUserOrDefault(seller.id)
    const systemFee = deal_amount.multipliedBy(getSystemFee(buyer, deal.deal_type, allFees) / 100)
    const sellerDealPoints = deal_amount.minus(systemFee)

    return {
      buyer: {
        total: buyerRedeemPoints,
        points: [
          {
            type: POINTS_TYPE.REDEEM,
            amount: buyerRedeemPoints,
            delivery_date,
            expiry_date,
          },
        ],
      },
      seller: {
        total: sellerRedeemPoints.plus(sellerDealPoints),
        points: [
          {
            type: POINTS_TYPE.REDEEM,
            amount: sellerRedeemPoints,
            delivery_date,
            expiry_date,
          },
          {
            type: POINTS_TYPE.DEAL,
            amount: sellerDealPoints,
            delivery_date,
            expiry_date,
          },
        ],
      },
    }
  }

  createDBObjects = async (
    buyer: UserEntity,
    seller: UserEntity,
    buyerSellerPoints: BuyerSellerPoints,
    paymentCurrency: string | TokenWhitelistEntity,
    reason: POINTS_REASON,
    note: object = {},
  ): Promise<UserPointsEntity[]> => {
    const paymentToken = await this.tokensService.getTokenInfo(paymentCurrency)
    // If you have a separate MVMNT token for the buyer's portion:
    const mvmntToken = this.tokensService.getMVMVNTToken()

    let buyerPoints: UserPointsEntity[] = []
    if (buyer) {
      buyerPoints = buyerSellerPoints.buyer.points.map((point: PointsInfo) => {
        const update = this.userPointUpdatesRepository.create({
          status: POINTS_STATUS.LOCKED,
          notes: note,
        })

        return this.userPointsRepository.create({
          user: buyer,
          reason,
          amount: point.amount,
          remaining: point.amount,
          status: POINTS_STATUS.LOCKED,
          withdraw_currency: { id: mvmntToken.id }, // Buyer gets MVMNT token
          type: point.type,
          delivery_date: point.delivery_date,
          expiry_date: point.expiry_date,
          updates: [update],
        })
      })
    }

    let sellerPoints: UserPointsEntity[] = []
    if (seller) {
      sellerPoints = buyerSellerPoints.seller.points.map((point: PointsInfo) => {
        const update = this.userPointUpdatesRepository.create({
          status: POINTS_STATUS.LOCKED,
          notes: note,
        })
        return this.userPointsRepository.create({
          user: seller,
          reason,
          amount: point.amount,
          remaining: point.amount,
          status: POINTS_STATUS.LOCKED,
          withdraw_currency: { id: paymentToken.id },
          type: point.type,
          delivery_date: point.delivery_date,
          expiry_date: point.expiry_date,
          updates: [update],
        })
      })
    }
    return [...buyerPoints, ...sellerPoints]
  }

  savePaymentItemGASPoints = async (
    amount: number,
    paymentItem: UserDealItemPaymentEntity,
    payment_currency: TokenWhitelistEntity,
  ) => {
    await this.userPointsRepository.save({
      user: paymentItem.sender,
      payment_points: paymentItem,
      reason: POINTS_REASON.DEAL,
      amount: amount,
      remaining: amount,
      status: POINTS_STATUS.UNLOCKED,
      withdraw_currency: payment_currency,
      type: POINTS_TYPE.GAS,
      delivery_date: this.getPointsDeliveryDate(),
      expiry_date: this.getPointsExpiryDate(paymentItem.sender.account_type),
    })
  }

  /**
   * lockPointsForDealPayment:
   *   - Acquire `pointsToRedeemQuantity` from user’s points of a particular currency,
   *     in REDEEMABLE statuses. Sort them by earliest expiry + earliest creation,
   *     then partially lock from each row until the request is satisfied or we run out.
   *   - If total locked < requested, throw INSUFFICIENT_POINTS.
   *   - The leftover in each row remains in the same row with status LOCKED_FOR_DEAL_PAYMENT
   *     so it can be reverted or confirmed later.
   * @param userId
   * @param paymentCurrencyId
   * @param pointsToRedeemQuantityInput
   * @param dealPaymentId
   * @param manager
   */
  async lockPointsForDealPayment(
    userId: string,
    paymentCurrencyId: string,
    pointsToRedeemQuantityInput: BigNumber | number,
    dealPaymentId: string,
    manager: EntityManager,
  ): Promise<{ redeemedValueInPaymentCurrency: BigNumber; pointsLockedQuantity: BigNumber }> {
    const pointsToRedeemQuantity = new BigNumber(pointsToRedeemQuantityInput)

    if (pointsToRedeemQuantity.isLessThanOrEqualTo(0)) {
      return {
        redeemedValueInPaymentCurrency: new BigNumber(0),
        pointsLockedQuantity: new BigNumber(0),
      }
    }

    // Find all user’s REDEEMABLE points for that currency
    const availablePoints = await manager.find(UserPointsEntity, {
      where: {
        user: { id: userId },
        withdraw_currency: { id: paymentCurrencyId },
        status: In(this.REDEEMABLE_STATUSES),
        remaining: MoreThan(0),
        locked_for_deal_payment_id: IsNull(),
      },
      order: { expiry_date: 'ASC', created: 'ASC' },
    })

    let totalPointsActuallyLocked = new BigNumber(0)
    let totalRedeemedValueInPaymentCurrency = new BigNumber(0)

    const pointEntitiesToUpdate: UserPointsEntity[] = []
    const pointUpdatesToCreate: UserPointUpdatesEntity[] = []

    for (const point of availablePoints) {
      if (totalPointsActuallyLocked.gte(pointsToRedeemQuantity)) break

      // How many do we still need to lock from this row?
      const neededFromThisRow = pointsToRedeemQuantity.minus(totalPointsActuallyLocked)
      const toTake = BigNumber.min(point.remaining, neededFromThisRow)
      if (toTake.isLessThanOrEqualTo(0)) continue

      const previousStatus = point.status
      const previousRemaining = point.remaining

      // Subtract from that row
      point.remaining = point.remaining.minus(toTake)
      // Mark the entire row as locked for THIS deal payment
      point.locked_for_deal_payment_id = dealPaymentId
      point.status = POINTS_STATUS.LOCKED_FOR_DEAL_PAYMENT

      pointEntitiesToUpdate.push(point)
      totalPointsActuallyLocked = totalPointsActuallyLocked.plus(toTake)

      // For 1:1 (points -> currency), the redeemed value is simply the number of points
      totalRedeemedValueInPaymentCurrency = totalRedeemedValueInPaymentCurrency.plus(toTake)

      const updateLog = manager.create(UserPointUpdatesEntity, {
        user_point: point,
        status: POINTS_STATUS.LOCKED_FOR_DEAL_PAYMENT,
        notes: {
          reason: `Locked for deal payment: ${dealPaymentId}`,
          amount_locked_from_this_entry: toTake.toString(),
          previous_status: previousStatus,
          previous_remaining_on_entry: previousRemaining.toString(),
          new_remaining_on_entry: point.remaining.toString(),
        },
      })
      pointUpdatesToCreate.push(updateLog)
    }

    if (totalPointsActuallyLocked.isLessThan(pointsToRedeemQuantity)) {
      throw new BadRequestException(ErrorKey.INSUFFICIENT_POINTS)
    }

    await manager.save(UserPointsEntity, pointEntitiesToUpdate)
    await manager.save(UserPointUpdatesEntity, pointUpdatesToCreate)

    return {
      redeemedValueInPaymentCurrency: totalRedeemedValueInPaymentCurrency,
      pointsLockedQuantity: totalPointsActuallyLocked,
    }
  }

  /**
   * confirmPointRedemptionForDealPayment:
   *   - The user has successfully paid, so we finalize the locked points as REDEEMED.
   *   - We expect that sum(locked) = dealPayment.points_used.
   */
  async confirmPointRedemptionForDealPayment(
    dealPayment: UserDealPaymentEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (!dealPayment.points_used || dealPayment.points_used.isLessThanOrEqualTo(0)) {
      return
    }

    const lockedPoints = await manager.find(UserPointsEntity, {
      where: {
        locked_for_deal_payment_id: dealPayment.id,
        status: POINTS_STATUS.LOCKED_FOR_DEAL_PAYMENT,
        user: { id: dealPayment.user.id },
        withdraw_currency: { id: dealPayment.payment_currency.id },
      },
    })

    // If we used points, but don't find them, that's a sync error
    if (lockedPoints.length === 0 && dealPayment.points_used.isGreaterThan(0)) {
      throw new InternalServerErrorException(
        `Points desync: expected locked points not found for payment ${dealPayment.id} confirmation.`,
      )
    }

    const pointUpdatesToCreate: UserPointUpdatesEntity[] = []
    const pointRedemptionsToCreate: UserPointRedemptionsEntity[] = []
    let totalConfirmed = new BigNumber(0)

    for (const point of lockedPoints) {
      const lockUpdate = await manager.findOne(UserPointUpdatesEntity, {
        where: { user_point: { id: point.id }, status: POINTS_STATUS.LOCKED_FOR_DEAL_PAYMENT },
        order: { created: 'DESC' },
      })
      const amountLocked = new BigNumber(
        (lockUpdate?.notes as any)?.amount_locked_from_this_entry || 0,
      )
      if (amountLocked.isLessThanOrEqualTo(0)) continue

      point.status = point.remaining.isGreaterThan(0)
        ? POINTS_STATUS.PARTIALLY_REDEEMED
        : POINTS_STATUS.REDEEMED
      // The `remaining` is already reduced at lock time. So at redemption,
      // it might be zero for the portion used. If it had leftover, that leftover
      // is also locked. If you want partial leftover to remain locked, you'd
      // have to split rows. This code lumps it all as REDEEMED for simplicity.

      totalConfirmed = totalConfirmed.plus(amountLocked)

      const updateLog = manager.create(UserPointUpdatesEntity, {
        user_point: point,
        status: POINTS_STATUS.REDEEMED,
        notes: {
          reason: `Redeemed for deal payment: ${dealPayment.id}`,
          amount_redeemed_from_this_entry: amountLocked.toString(),
        },
      })
      pointUpdatesToCreate.push(updateLog)

      const redemptionRecord = manager.create(UserPointRedemptionsEntity, {
        userPoints: point,
        amount: amountLocked,
        deal_payment: dealPayment,
      })
      pointRedemptionsToCreate.push(redemptionRecord)
    }

    // If the sum of locked usage doesn't match the payment’s total usage
    if (!totalConfirmed.isEqualTo(dealPayment.points_used)) {
      throw new InternalServerErrorException(
        `Points redemption mismatch for payment ${dealPayment.id}. Locked total: ${totalConfirmed}, Payment usage: ${dealPayment.points_used}`,
      )
    }

    await manager.save(UserPointsEntity, lockedPoints)
    await manager.save(UserPointUpdatesEntity, pointUpdatesToCreate)
    await manager.save(UserPointRedemptionsEntity, pointRedemptionsToCreate)
  }

  /**
   * revertPointLockForDealPayment:
   *   - If something goes wrong and we must cancel or revert the payment, we unlock
   *     the previously locked points and restore them to their previous statuses.
   */
  async revertPointLockForDealPayment(
    dealPayment: UserDealPaymentEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (!dealPayment.points_used || dealPayment.points_used.isLessThanOrEqualTo(0)) {
      return
    }

    const lockedPoints = await manager.find(UserPointsEntity, {
      where: {
        locked_for_deal_payment_id: dealPayment.id,
        status: POINTS_STATUS.LOCKED_FOR_DEAL_PAYMENT,
        user: { id: dealPayment.user.id },
        withdraw_currency: { id: dealPayment.payment_currency.id },
      },
    })

    // If we were supposed to revert points but didn't find them, just return
    if (lockedPoints.length === 0) {
      return
    }

    const pointUpdatesToCreate: UserPointUpdatesEntity[] = []
    let totalRevertedQuantity = new BigNumber(0)

    for (const point of lockedPoints) {
      const lockUpdate = await manager.findOne(UserPointUpdatesEntity, {
        where: { user_point: { id: point.id }, status: POINTS_STATUS.LOCKED_FOR_DEAL_PAYMENT },
        order: { created: 'DESC' },
      })

      if (
        !lockUpdate ||
        !(lockUpdate.notes as any)?.amount_locked_from_this_entry ||
        !(lockUpdate.notes as any)?.previous_status
      ) {
        throw new InternalServerErrorException(
          `Cannot revert point ${point.id} for payment ${dealPayment.id}: missing lock info.`,
        )
      }

      const amountLockedFromThisEntry = new BigNumber(
        (lockUpdate.notes as any).amount_locked_from_this_entry,
      )
      const previousStatusBeforeLock = (lockUpdate.notes as any).previous_status as POINTS_STATUS

      if (amountLockedFromThisEntry.isLessThanOrEqualTo(0)) {
        continue
      }

      // Add back the locked portion
      point.remaining = point.remaining.plus(amountLockedFromThisEntry)

      // Restore the old status
      point.status = previousStatusBeforeLock

      // Unset the locked_for_deal_payment_id
      point.locked_for_deal_payment_id = null

      // If there's some mismatch (like we ended up with 0 leftover?), handle gracefully
      // E.g. if leftover is 0, we might not want to call it DELIVERED.
      // For example, if the row was partially redeemed before, leftover might be partial.
      // This block enforces that if there's any leftover after revert, we keep the old status.
      // If leftover is 0, you might want to keep it PARTIALLY_REDEEMED, or maybe REDEEMED.
      // We'll just trust the "previousStatusBeforeLock" logic here:
      if (point.remaining.isGreaterThan(point.amount)) {
        // Safety net: can't exceed original amount
        point.remaining = point.amount
      }

      const updateLog = manager.create(UserPointUpdatesEntity, {
        user_point: point,
        status: point.status,
        notes: {
          reason: `Reverted lock for payment: ${dealPayment.id}`,
          amount_reverted_to_entry: amountLockedFromThisEntry.toString(),
          restored_status: point.status,
          new_remaining_on_entry: point.remaining.toString(),
        },
      })
      pointUpdatesToCreate.push(updateLog)
      totalRevertedQuantity = totalRevertedQuantity.plus(amountLockedFromThisEntry)
    }

    // If the total revert doesn't match the payment usage, we throw an error
    if (
      !totalRevertedQuantity.isEqualTo(dealPayment.points_used) &&
      dealPayment.points_used.isGreaterThan(0) &&
      lockedPoints.length > 0
    ) {
      throw new InternalServerErrorException(
        `Points lock reversion quantity mismatch for payment ${dealPayment.id}. Expected to revert ${dealPayment.points_used}, but processed ${totalRevertedQuantity}.`,
      )
    }

    await manager.save(UserPointsEntity, lockedPoints)
    await manager.save(UserPointUpdatesEntity, pointUpdatesToCreate)
  }

  revertPaymentDonationPoints = async (
    paymentDonationIds: string[],
    transaction: EntityManager,
  ) => {
    await transaction.update(
      UserPointsEntity,
      { donation_points: In(paymentDonationIds) },
      { status: POINTS_STATUS.REVERTED },
    )
  }

  revertPaymentItemPoints = async (paymentItemIds: string[], transaction: EntityManager) => {
    await transaction.update(
      UserPointsEntity,
      { payment_points: In(paymentItemIds) },
      { status: POINTS_STATUS.REVERTED },
    )
  }

  pendingPoints = pendingPointsService.bind(this)
  pointsHistory = pointsHistoryService.bind(this)
  effectiveDate = effectiveDateService.bind(this)
  saveShopifyPoints = saveShopifyPointsService.bind(this)
}
