import { IsDefined } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { CommonRO } from '@app/src/shared/dto'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

export class DealRafflePurchaseRO extends CommonRO {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty()
  readonly raffle_ticket_price: number

  @ApiProperty()
  readonly quantity: number

  @ApiProperty()
  readonly total_amount: number

  @ApiProperty({ type: DealEntity })
  @IsDefined()
  deal: DealEntity

  @ApiProperty({ type: UserEntity })
  @IsDefined()
  user: UserEntity
}
