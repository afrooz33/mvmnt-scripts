import { IsDefined, IsEmail } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CommonRO } from '@app/src/shared/dto'
import { JwtDto } from '@app/src/shared/auth/dto'
import { UserGrade } from '@app/src/users/grades/enums'
import { Blocked } from '@app/src/users/user/entities/properties'
import { ProfileEntity } from '@app/src/users/profile/entities/profile.entity'
import { AccountStatus, UserAccountType, UserRank } from '@app/src/users/user/enums'

export class UserRO extends CommonRO {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty()
  @IsEmail()
  @IsDefined()
  readonly email: string

  @ApiProperty()
  readonly display_name?: string

  @ApiProperty()
  readonly username?: string

  @ApiProperty()
  readonly two_factor_enabled: boolean

  @ApiProperty({ enum: UserAccountType })
  readonly account_type: UserAccountType

  @ApiProperty({ enum: AccountStatus })
  readonly account_status: AccountStatus

  @ApiPropertyOptional()
  brand_url?: string

  @ApiPropertyOptional()
  follower_count?: number

  @ApiPropertyOptional()
  following_count?: number

  @ApiPropertyOptional({ type: JwtDto })
  jwt?: JwtDto

  @ApiPropertyOptional({ type: ProfileEntity })
  profile?: ProfileEntity

  @ApiPropertyOptional()
  total_donations?: number

  @ApiPropertyOptional()
  gross_donations?: number

  @ApiPropertyOptional()
  total_buy?: number

  @ApiPropertyOptional()
  total_sell?: number

  @ApiPropertyOptional()
  last_login?: string

  @ApiPropertyOptional()
  blocked_details?: Blocked

  @ApiPropertyOptional()
  ranking?: any

  @ApiPropertyOptional()
  gender?: any

  @ApiPropertyOptional()
  referral_code?: string

  @ApiPropertyOptional()
  identity_documents?: any

  @ApiPropertyOptional()
  is_verified?: boolean

  @ApiPropertyOptional()
  readonly wallet_address?: string

  @ApiPropertyOptional()
  readonly smart_account?: string

  @ApiPropertyOptional()
  nonprofit?: any

  @ApiPropertyOptional()
  rank?: UserRank

  @ApiPropertyOptional()
  grade?: UserGrade
}
