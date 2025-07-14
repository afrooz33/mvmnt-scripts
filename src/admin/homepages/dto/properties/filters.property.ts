import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { UserAccountType } from '@app/src/users/user/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[account_type]',
    enum: UserAccountType,
    description: 'Filter by account type',
  })
  @IsOptional()
  @IsEnum(UserAccountType)
  readonly account_type?: UserAccountType
}
