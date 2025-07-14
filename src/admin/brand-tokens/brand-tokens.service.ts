import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { BrandTokenRequestEntity } from '@app/src/brand-tokens/entities/brand-token-request.entity'
import { BrandTokenRequestStatus } from '@app/src/brand-tokens/enums'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { AdminNotesDto, BrandTokenRequestQueryDto } from '@app/src/admin/brand-tokens/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { WalletType, PaymentMethodStatus } from '@app/src/users/payment-method/enums'
import { BrandTokenEntity } from '@app/src/brand-tokens/entities/brand-token.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

@Injectable()
export class BrandTokensService extends MyService<BrandTokenRequestEntity> {
  constructor(
    @InjectRepository(BrandTokenRequestEntity)
    protected readonly btRequestRepository: Repository<BrandTokenRequestEntity>,
    @InjectRepository(BrandTokenEntity)
    private readonly brandTokenRepository: Repository<BrandTokenEntity>,
    @InjectRepository(PaymentWalletsEntity)
    protected readonly paymentWalletRepository: Repository<PaymentWalletsEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {
    super(btRequestRepository, 'admin/brand-tokens')
  }

  async show(query: BrandTokenRequestQueryDto): Promise<PaginateRO> {
    try {
      const results = new QueryBuilder(query)
        .useQuery(this.btRequestRepository)
        .addRelation('user')
        .addRelation('brand_token')
        .create()

      results.condition.select([
        'data.id',
        'data.status',
        'data.created',
        'data.admin_notes',
        'user.id',
        'user.email',
        'user.display_name',
        'brand_token.id',
        'brand_token.name',
        'brand_token.symbol',
      ])

      if (query.filter?.status) {
        results.condition.andWhere('data.status = :status', {
          status: query.filter.status,
        })
      }

      // Handle date filtering
      if (query.created_date?.leading_date && query.created_date?.trailing_date) {
        results.condition.andWhere('data.created BETWEEN :startDate AND :endDate', {
          startDate: new Date(query.created_date.leading_date),
          endDate: new Date(query.created_date.trailing_date),
        })
      } else if (query.created_date?.leading_date) {
        results.condition.andWhere('data.created >= :startDate', {
          startDate: new Date(query.created_date.leading_date),
        })
      } else if (query.created_date?.trailing_date) {
        results.condition.andWhere('data.created <= :endDate', {
          endDate: new Date(query.created_date.trailing_date),
        })
      }

      return await this.paginate(results)
    } catch (error) {
      return HandleErrors(error)
    }
  }

  private validateRequestStatus(
    request: BrandTokenRequestEntity,
    newStatus: BrandTokenRequestStatus,
  ) {
    const { status } = request

    if (status === newStatus) {
      throw new BadRequestException(`Request is already ${newStatus.toLowerCase()}`)
    }
    if (
      (status === BrandTokenRequestStatus.APPROVED &&
        newStatus === BrandTokenRequestStatus.REJECTED) ||
      (status === BrandTokenRequestStatus.REJECTED &&
        newStatus === BrandTokenRequestStatus.APPROVED)
    ) {
      throw new BadRequestException(
        `Cannot change status from ${status.toLowerCase()} to ${newStatus.toLowerCase()}`,
      )
    }
  }

  private async validateUserWallet(userId: string): Promise<PaymentWalletsEntity> {
    return await this.paymentWalletRepository.findOneOrFail({
      where: {
        user: { id: userId },
        type: WalletType.SMART_ACCOUNT,
        status: PaymentMethodStatus.ACTIVE,
        is_verified: true,
        is_default: true,
        is_internal: true,
      },
      select: {
        id: true,
        address: true,
      },
    })
  }

  private async validateUserEligibility(userId: string): Promise<void> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      select: {
        id: true,
        created: true,
        is_verified: true,
      },
    })

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const userCreatedDate = new Date(user.created)

    if (userCreatedDate > thirtyDaysAgo || !user.is_verified) {
      throw new BadRequestException(ErrorKey.NOT_ELIGIBLE_FOR_BRAND_TOKEN)
    }
  }

  async approve(id: string, adminNotes: string): Promise<SuccessRO> {
    return this.updateRequestStatus(
      id,
      BrandTokenRequestStatus.APPROVED,
      adminNotes,
      'Brand token request approved',
    )
  }

  async reject(id: string, payload: AdminNotesDto): Promise<SuccessRO> {
    return this.updateRequestStatus(
      id,
      BrandTokenRequestStatus.REJECTED,
      payload.admin_notes,
      ErrorKey.BRAND_TOKEN_REQUEST_REJECTED,
    )
  }

  private async updateRequestStatus(
    id: string,
    newStatus: BrandTokenRequestStatus,
    adminNotes: string,
    successMessage: string,
  ): Promise<SuccessRO> {
    try {
      const request = await this.btRequestRepository.findOne({
        where: { id },
        relations: ['user', 'brand_token'],
        select: {
          id: true,
          status: true,
          user: { id: true, email: true },
          brand_token: { id: true, name: true },
        },
      })

      if (!request) {
        throw new NotFoundException(ErrorKey.BRAND_TOKEN_REQUEST_NOT_FOUND)
      }

      // Validate status transition
      this.validateRequestStatus(request, newStatus)

      if (newStatus === BrandTokenRequestStatus.APPROVED) {
        await this.validateUserEligibility(request.user.id)
        await this.validateUserWallet(request.user.id)
      }

      // Use transaction for atomic operations
      const queryRunner = this.dataSource.createQueryRunner()
      await queryRunner.connect()
      await queryRunner.startTransaction()

      try {
        // Update request status and notes
        request.status = newStatus
        request.admin_notes = adminNotes

        if (newStatus === BrandTokenRequestStatus.APPROVED) {
          request.approved_at = new Date()
        } else if (newStatus === BrandTokenRequestStatus.REJECTED) {
          request.rejected_at = new Date()
        }

        await queryRunner.manager.save(BrandTokenRequestEntity, request)

        // Update brand token status if needed
        if (newStatus === BrandTokenRequestStatus.REJECTED && request.brand_token) {
          await queryRunner.manager.update(BrandTokenEntity, request.brand_token.id, {
            is_deployed: false,
          })
        }

        await queryRunner.commitTransaction()

        return {
          success: true,
          message: successMessage,
        }
      } catch (error) {
        await queryRunner.rollbackTransaction()
        throw error
      } finally {
        await queryRunner.release()
      }
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async showOne(id: string) {
    try {
      const request = await this.documentExists({
        condition: [
          {
            where: { id },
            relations: ['user', 'brand_token'],
            select: {
              id: true,
              status: true,
              created: true,
              updated: true,
              admin_notes: true,
              approved_at: true,
              rejected_at: true,
              user: {
                id: true,
                email: true,
                display_name: true,
                username: true,
              },
              brand_token: {
                id: true,
                name: true,
                symbol: true,
                total_supply: true,
                short_description: true,
                introduction: true,
                logo: true,
                website_url: true,
                telegram_account: true,
                discord_account: true,
                contract_address: true,
                is_deployed: true,
              },
            },
          },
        ],
        errorMessage: ErrorKey.BRAND_TOKEN_REQUEST_NOT_FOUND,
      })

      return {
        success: true,
        data: request,
      }
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async hasUserPendingRequests(userId: string): Promise<boolean> {
    const pendingRequest = await this.btRequestRepository.findOne({
      where: {
        user: { id: userId },
        status: BrandTokenRequestStatus.PENDING,
      },
      select: {
        id: true,
      },
    })

    return !!pendingRequest
  }

  async validateNoExistingRequests(userId: string): Promise<void> {
    const hasPending = await this.hasUserPendingRequests(userId)
    if (hasPending) {
      throw new BadRequestException(ErrorKey.BRAND_TOKEN_REQUEST_EXISTS)
    }
  }
}
