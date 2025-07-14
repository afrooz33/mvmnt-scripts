import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator'
import { IntegrationPayloadStatus } from '@app/src/re2/integrations/enums'

export class FiltersProperty {
  @ApiProperty({
    description: 'Shopify integration id',
    name: 'filter[shopify_integration]',
    required: true,
    format: 'uuid',
    example: '5b0420ae-e0b7-474b-bfc6-3c0011cea95e',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly shopify_integration: string

  @ApiPropertyOptional({
    name: 'filter[status]',
    description: 'Integration status',
    required: false,
    enum: Object.values(IntegrationPayloadStatus),
  })
  @IsEnum(IntegrationPayloadStatus)
  @IsOptional()
  readonly status?: IntegrationPayloadStatus
}
