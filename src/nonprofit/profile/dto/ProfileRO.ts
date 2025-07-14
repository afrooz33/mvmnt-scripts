import { ApiProperty } from '@nestjs/swagger'
import { DonationPreset, SocialAccounts } from '@app/src/nonprofit/profile/entities/properties'
import { UserDto } from '@app/src/shared/dto'

export class ProfileRO {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty()
  readonly first_name: string

  @ApiProperty()
  readonly last_name: string

  @ApiProperty()
  readonly notification_email: string

  @ApiProperty()
  readonly foundation_name: string

  @ApiProperty()
  readonly foundation_url: string

  @ApiProperty()
  readonly introduction: string

  @ApiProperty()
  readonly corporate_number: string

  @ApiProperty()
  readonly phone: string

  @ApiProperty()
  readonly phone_number: string

  @ApiProperty()
  readonly profile_picture: string

  @ApiProperty()
  readonly social_accounts: SocialAccounts

  @ApiProperty()
  readonly donation_presets: DonationPreset

  @ApiProperty({ type: UserDto })
  readonly user: UserDto
}
