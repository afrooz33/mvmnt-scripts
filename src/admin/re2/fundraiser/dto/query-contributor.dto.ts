import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { AccountIntegration } from '@app/src/admin/re2/fundraiser/enums'
import { DateRange } from '@app/src/admin/re2/fundraiser/dto/properties'
import { GrossDonationRangeProperty } from '@app/src/admin/deals/dto/properties'

export class QueryContributorDto extends MySearchDto {
  @ApiProperty({
    description: 'RE2 source type, either fundraiser or integration',
    required: true,
    enum: ['fundraiser', 'integration'],
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(['fundraiser', 'integration'])
  readonly source: string

  @ApiProperty({
    description: 'MVMNT and RE2 integration status',
    required: true,
    enum: Object.values(AccountIntegration),
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(AccountIntegration)
  readonly account_integration: AccountIntegration

  @ApiPropertyOptional({
    description: 'Gross donation range',
    type: GrossDonationRangeProperty,
  })
  @IsNotEmpty()
  @IsOptional()
  readonly gross_donation?: GrossDonationRangeProperty

  @ApiPropertyOptional({ description: 'Donation source start and end date' })
  @IsOptional()
  @IsNotEmpty()
  readonly start_date?: DateRange
}
