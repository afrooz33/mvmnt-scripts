import { DealType } from '@app/src/users/deal/enums'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsUUID, ValidateIf, IsEnum, IsNotEmpty } from 'class-validator'

export class ApplyCodeQueryDto {
  @ApiPropertyOptional({
    description: 'Cart ID',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  @ValidateIf((object) => object.deal_type === DealType.BUYNOW)
  readonly cart?: string

  @ApiPropertyOptional({
    description: 'Bid ID',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  @ValidateIf((object) => object.deal_type === DealType.AUCTION)
  readonly bid?: string

  @ApiPropertyOptional({
    description: 'Raffle ID',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  @ValidateIf((object) => object.deal_type === DealType.RAFFLE)
  readonly raffle?: string

  @ApiProperty({
    description: 'Deal type',
    enum: Object.values(DealType),
  })
  @IsNotEmpty()
  @IsEnum(DealType)
  readonly deal_type: DealType
}
