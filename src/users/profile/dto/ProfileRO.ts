import { ApiProperty } from '@nestjs/swagger'
import { UserDto } from '@app/src/shared/dto'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { IdentityVerificationStatus } from '@app/src/users/profile/enums'
import { SocialAccounts } from '@app/src/users/profile/entities/properties'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { ProfileNameDto } from './'

export class ProfileRO {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty()
  readonly introduction: string

  @ApiProperty()
  readonly corporate_number: string

  @ApiProperty()
  readonly phone: string

  @ApiProperty()
  readonly phone_number: string

  @ApiProperty()
  readonly profile_images: ImagesEntity

  @ApiProperty()
  readonly language: LanguageEntity

  @ApiProperty()
  readonly name: ProfileNameDto

  @ApiProperty()
  readonly social_accounts: SocialAccounts

  @ApiProperty({ type: UserDto })
  readonly user: UserDto

  @ApiProperty({ type: IdentityVerificationStatus })
  readonly identity_verification_status: IdentityVerificationStatus
}
