import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'

export class QueryDto extends MySearchDto {
  @ApiProperty({
    description: 'Wishlist id',
    format: 'uuid',
    example: '6983f818-9814-45da-94f0-7e0dc1742f7f',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly wishlist: string

  @ApiProperty({
    description: 'Variant id',
    format: 'uuid',
    example: '1e01782e-c2c7-46fa-8dd1-7e0f60b8b2cd',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly variant: string

  @ApiPropertyOptional({
    description: 'Comment ID',
    format: 'uuid',
    example: 'bd71d247-33b1-4a15-81cc-9f6dc6cdf0ae',
  })
  @IsUUID()
  @IsOptional()
  readonly parent?: string
}
