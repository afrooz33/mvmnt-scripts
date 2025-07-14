import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsOptional, IsUUID } from 'class-validator'

export class CreateCartDto {
  @ApiProperty({
    description: 'The deal id',
    format: 'uuid',
    example: 'b3015a4e-a779-418e-9d2c-a42f1607b54b',
    nullable: false,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly deal: string

  @ApiProperty({
    description: 'The deal variant id',
    format: 'uuid',
    example: '9f399284-ed6b-4716-bd98-dc51ce9f188f',
    nullable: false,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly variant: string

  @ApiPropertyOptional({
    description: 'Wishlist id',
    format: 'uuid',
    example: '6983f818-9814-45da-94f0-7e0dc1742f7f',
  })
  @IsUUID()
  @IsOptional()
  readonly wishlist: string

  @ApiProperty({
    description: 'The quantity of the deal variant',
    format: 'number',
    example: 1,
    nullable: false,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly quantity: number

  @IsOptional()
  total: number
}
