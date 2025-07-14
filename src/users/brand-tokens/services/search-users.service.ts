import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { SearchUsersDto } from '@app/src/brand-tokens/dto'
import { WalletType, PaymentMethodStatus } from '@app/src/users/payment-method/enums'

export async function searchUsersService(query: SearchUsersDto): Promise<PaginateRO> {
  try {
    const results = new QueryBuilder(query).useQuery(this.userRepository).create()

    results.condition
      .leftJoinAndSelect(
        'data.wallets',
        'wallets',
        'wallets.type = :walletType AND wallets.status = :status AND wallets.is_default = :isDefault AND wallets.is_verified = :isVerified',
        {
          walletType: WalletType.SMART_ACCOUNT,
          status: PaymentMethodStatus.ACTIVE,
          isDefault: true,
          isVerified: true,
        },
      )
      .select([
        'data.id',
        'data.email',
        'data.username',
        'data.display_name',
        'wallets.id',
        'wallets.address',
        'wallets.status',
        'wallets.type',
        'wallets.is_internal',
        'wallets.is_verified',
        'wallets.is_default',
      ])

    if (query.keyword) {
      results.condition.andWhere(
        '(data.email ILIKE :search OR data.username ILIKE :search OR data.display_name ILIKE :search)',
        { search: `%${query.keyword}%` },
      )
    }

    results.condition.orderBy('data.created', 'DESC')

    const response = await this.rawPaginate(results)

    return response
  } catch (error) {
    return HandleErrors(error)
  }
}
