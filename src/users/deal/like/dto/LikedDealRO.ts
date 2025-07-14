import { ApiProperty } from '@nestjs/swagger'
import { CommonRO } from '@app/src/shared/dto'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

export class LikedDealRO extends CommonRO {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty({ type: UserEntity })
  readonly user: UserEntity

  @ApiProperty({ type: DealEntity })
  readonly deal: DealEntity
}
