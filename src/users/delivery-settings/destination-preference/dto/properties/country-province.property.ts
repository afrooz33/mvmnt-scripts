import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsUUID, ValidateNested } from 'class-validator'

export class DestinationProvinceProperty {
  @ApiPropertyOptional({
    description: 'Earliest date of delivery',
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  readonly earliest_days?: number

  @ApiProperty({
    description: 'Province id',
    format: 'uuid',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  readonly province: string
}

export class DestinationCountryProperty {
  @ApiPropertyOptional({
    description: 'Earliest date of delivery',
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  readonly earliest_days?: number

  @ApiProperty({
    description: 'Country id',
    format: 'uuid',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  readonly country: string

  @ApiPropertyOptional({
    type: [DestinationProvinceProperty],
    description: 'List of provinces',
  })
  @IsArray()
  @IsOptional()
  @Type(() => DestinationProvinceProperty)
  @ValidateNested({ each: true })
  readonly destination_province: DestinationProvinceProperty[]
}
