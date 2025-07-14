import { ArrayMinSize, IsArray, IsDefined, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ShippingMethodStatus } from '@app/src/admin/shipping-methods/enums'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { IsImageAvailable, IsLanguageActive } from '@app/src/shared/decorators'
import { UploadType } from '@app/src/shared/enums'
import { ShippingMethodTranslations } from '@app/src/admin/shipping-methods/dto/properties'

export class CreateShippingMethodDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  @IsOptional()
  @IsImageAvailable(
    {
      message: 'Image is not available',
    },
    UploadType.SHIPPING_METHOD,
  )
  image?: ImagesEntity

  @ApiProperty({
    type: [ShippingMethodTranslations],
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsLanguageActive({
    message: 'Invalid language',
  })
  readonly translations: ShippingMethodTranslations[]

  @ApiProperty({ enum: ShippingMethodStatus, required: true })
  @IsDefined()
  @IsEnum(ShippingMethodStatus)
  @IsDefined()
  readonly status: ShippingMethodStatus
}
