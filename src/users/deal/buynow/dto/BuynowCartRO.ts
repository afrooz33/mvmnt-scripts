import { ApiProperty } from '@nestjs/swagger'
import { UserDto } from '@app/src/shared/dto'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { CartStatus } from '@app/src/users/deal/buynow/enums'

export class BuynowCartRO {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty({ type: UserDto })
  readonly user: UserDto

  @ApiProperty({ type: DealEntity })
  readonly deal: DealEntity

  @ApiProperty({ isArray: true })
  readonly items: any

  @ApiProperty({ enum: Object.values(CartStatus), type: 'enum' })
  readonly status: CartStatus
}
