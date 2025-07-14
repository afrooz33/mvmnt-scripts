import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { IdentityRequestsQueryDto } from '@app/src/admin/users/dto'
import { IdentityVerificationStatus, VerificationStatus } from '@app/src/users/profile/enums'

export default async function (query: IdentityRequestsQueryDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userRepository)
      .addRelation(Query.PROFILE)
      .create()

    results.condition.andWhere('"profile"."identity_verification_status" = :status', {
      status: VerificationStatus.REVIEW,
    })

    results.condition.innerJoinAndSelect(
      'data.identity_documents',
      'identity_documents',
      'identity_documents.status = :verification_status',
      { verification_status: IdentityVerificationStatus.REVIEW },
    )

    results.condition.select([
      'data.id',
      'profile.id',
      'data.created',
      'data.username',
      'data.display_name',
      'data.account_type',
      'identity_documents',
      'profile.social_accounts',
      'profile.verification_status',
      'profile.identity_verification_status',
    ])

    return await this.paginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
