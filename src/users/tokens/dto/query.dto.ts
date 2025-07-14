import { IsEnum, IsOptional } from 'class-validator'
import { MyPaginateDto } from '@app/src/shared/base'

export class QueryDto extends MyPaginateDto {
  @IsOptional()
  @IsEnum(['Yes', 'No'])
  is_whitelisted?: 'Yes' | 'No'
}
