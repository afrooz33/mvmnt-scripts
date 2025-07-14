import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsUUID, ValidateNested, IsArray, IsNotEmpty, IsOptional } from 'class-validator'

class UpdateProvinceProperty {
  @ApiPropertyOptional({
    type: 'string',
    description: 'Shipping zone country province id',
    format: 'uuid',
    example: '151edd78-ce3a-4f80-94df-04613112019e',
  })
  @IsUUID()
  @IsOptional()
  id: string

  @ApiPropertyOptional({
    type: 'string',
    description: 'Province ID',
    format: 'uuid',
    example: 'c510ff55-eee9-40d3-abde-bd98a3525063',
  })
  @IsUUID()
  @IsOptional()
  province_id: string
}

export class UpdateCountryProperty {
  @ApiPropertyOptional({
    type: 'string',
    description: 'Shipping zone country id',
    format: 'uuid',
    example: '0cd6965f-8189-4bdc-8798-66347225ecab',
  })
  @IsUUID()
  @IsOptional()
  id: string

  @ApiProperty({
    type: 'string',
    description: 'Country ID',
    format: 'uuid',
    example: 'e4906f64-1142-49ac-8c52-8cc4a744c19b',
  })
  @IsUUID()
  @IsNotEmpty({ each: true })
  country_id: string

  @ApiPropertyOptional({
    type: [UpdateProvinceProperty],
    description: 'List of provinces',
  })
  @IsArray()
  @IsOptional()
  @Type(() => UpdateProvinceProperty)
  @ValidateNested({ each: true })
  shipping_zone_province: UpdateProvinceProperty[]
}
