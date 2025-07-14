import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsUUID, ValidateNested, IsArray, IsNotEmpty, IsOptional } from 'class-validator'

class ProvinceProperty {
  @ApiPropertyOptional({
    type: 'string',
    description: 'Province ID',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  id: string
}

export class CountryProperty {
  @ApiProperty({
    type: 'string',
    description: 'Country ID',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty({ each: true })
  id: string

  @ApiPropertyOptional({
    type: [ProvinceProperty],
    description: 'List of provinces',
  })
  @IsArray()
  @IsOptional()
  @Type(() => ProvinceProperty)
  @ValidateNested({ each: true })
  shipping_zone_province: ProvinceProperty[]
}
