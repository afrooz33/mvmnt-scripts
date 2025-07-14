import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty } from 'class-validator'
import { UploadType } from '@app/src/shared/enums'
import { IsImageAvailable } from '@app/src/shared/decorators'
import { IdentityDocumentType } from '@app/src/users/profile/enums'
import { ImagesEntity } from '@app/src/images/entities/images.entity'

export class IdentityDocuments {
  @ApiProperty({
    description: 'Identity document type',
    enum: Object.values(IdentityDocumentType),
    nullable: false,
    default: IdentityDocumentType.DRIVING_LICENSE,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly type: IdentityDocumentType

  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: '17163e8f-c818-42df-82ed-98fa6909a8d6',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsImageAvailable(
    {
      message: 'Image is not available',
    },
    UploadType.USER_VERIFICATION,
  )
  readonly front_image: ImagesEntity

  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: '3e51de5b-6fca-4b80-9736-184645540943',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsImageAvailable(
    {
      message: 'Image is not available',
    },
    UploadType.USER_VERIFICATION,
  )
  readonly back_image: ImagesEntity
}
