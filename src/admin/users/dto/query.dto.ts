import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsEnum, ArrayMaxSize, IsArray, ArrayMinSize } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { UsersSearchFields } from '@app/src/shared/enums'
import { AccountStatus, UserAccountType } from '@app/src/users/user/enums'
import { SocialAccountsType, IncludesQuery } from '@app/src/admin/users/enums'
import {
  TotalSalesRangeProperty,
  ContributionAmountRangeProperty,
} from '@app/src/admin/deals/dto/properties'
import {
  PastSpentProperty,
  LastShoppingDateRange,
  GrossDonationProperty,
  LastLoginRangeProperty,
  NumberOfFollowerProperty,
} from './properties'

export class QueryDto extends MySearchDto {
  constructor() {
    super(UsersSearchFields)
  }

  @ApiPropertyOptional({
    name: 'social_account[]',
    enum: Object.values(SocialAccountsType),
    description: 'Social account type',
    isArray: true,
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  readonly social_account?: SocialAccountsType[]

  @ApiPropertyOptional({
    name: 'account_type[]',
    enum: [...Object.values(UserAccountType), ''],
    description: 'User account type (can be blank)',
    isArray: true,
    nullable: true,
  })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  @ArrayMaxSize(4)
  @IsEnum([...Object.values(UserAccountType), ''], { each: true, always: false })
  readonly account_type?: (UserAccountType | '')[]

  @ApiPropertyOptional({
    name: 'account_status[]',
    enum: [
      AccountStatus.BLOCKED,
      AccountStatus.ENABLED,
      AccountStatus.REJECTED,
      AccountStatus.DISABLED,
      AccountStatus.UNDER_REVIEW,
    ],
    description: 'User account status',
    isArray: true,
    nullable: true,
  })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  @IsEnum(AccountStatus, { each: true })
  readonly account_status?: AccountStatus[]

  @ApiPropertyOptional({
    description: 'Number of follower',
    example: 100,
    type: NumberOfFollowerProperty,
  })
  @IsOptional()
  readonly follower?: NumberOfFollowerProperty

  @ApiPropertyOptional({
    description: 'Total gross donations',
    example: 100,
    type: GrossDonationProperty,
  })
  @IsOptional()
  readonly gross_donation?: GrossDonationProperty

  @ApiPropertyOptional({
    name: 'includes[]',
    description: 'Relations',
    isArray: true,
    enum: Object.values(IncludesQuery),
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEnum(IncludesQuery, { each: true })
  readonly includes?: IncludesQuery[]

  @ApiPropertyOptional({
    type: LastLoginRangeProperty,
    description: 'Last login date range',
  })
  @IsOptional()
  readonly last_login?: LastLoginRangeProperty

  @ApiPropertyOptional({
    description: 'Total past spent',
    example: 100,
    type: PastSpentProperty,
  })
  @IsOptional()
  readonly past_spent?: PastSpentProperty

  @ApiPropertyOptional({
    description: 'Total purchases',
    example: 100,
    type: TotalSalesRangeProperty,
  })
  @IsOptional()
  readonly total_sales?: TotalSalesRangeProperty

  @ApiPropertyOptional({
    description: 'Contribution amount',
    example: 100,
    type: ContributionAmountRangeProperty,
  })
  @IsOptional()
  readonly contribution_amount?: ContributionAmountRangeProperty

  @ApiPropertyOptional({
    description: 'Last shopping date range',
    example: 100,
    type: LastShoppingDateRange,
  })
  @IsOptional()
  readonly last_shopping_date?: LastShoppingDateRange
}
