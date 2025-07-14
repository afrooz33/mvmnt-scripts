import { IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { OnlyNameSearchFields } from '@app/src/shared/enums'

export class QueryDto extends MySearchDto {
  constructor() {
    super(OnlyNameSearchFields)
  }

  @ApiPropertyOptional({
    enum: ['Yes', 'No'],
    description: 'Get only whitelisted tokens',
    required: false,
  })
  @IsOptional()
  @IsEnum(['Yes', 'No'])
  is_whitelisted?: 'Yes' | 'No'
}
