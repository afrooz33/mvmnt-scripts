import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsOptional, IsUUID, MinLength } from 'class-validator'

export class GetPostcodeDto {
  @ApiPropertyOptional({
    description: 'Country',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly country?: string

  @ApiProperty({
    description: 'Postcode at least 3 characters long',
    example: 'SW1A 1AA',
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @MinLength(3)
  readonly postcode: string
}
