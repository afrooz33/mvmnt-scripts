import { IsDefined } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { CommonRO } from '@app/src/shared/dto'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

export class DealBidRO extends CommonRO {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty()
  readonly bid_amount: number

  @ApiProperty()
  readonly quantity: number

  @ApiProperty()
  readonly delivery_cost: number

  @ApiProperty()
  readonly total_amount: number

  @ApiProperty()
  readonly status: BidStatus

  @ApiProperty()
  readonly purchase_date: any

  @ApiProperty({ type: DealEntity })
  @IsDefined()
  deal: DealEntity

  @ApiProperty({ type: UserEntity })
  @IsDefined()
  user: UserEntity
}
