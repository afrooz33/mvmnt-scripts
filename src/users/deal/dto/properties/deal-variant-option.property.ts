import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsUUID, IsDefined, IsString, MaxLength, IsNotEmpty, IsOptional } from 'class-validator'

export class DealVariantOption {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: '87c2efee-41c1-4e25-ab81-a33ca137780f',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly option: string

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(255)
  readonly value: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly label_name: string
}
