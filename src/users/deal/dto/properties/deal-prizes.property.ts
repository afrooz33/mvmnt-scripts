import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
} from 'class-validator'
import { UploadType } from '@app/src/shared/enums'
import { ApiProperty } from '@nestjs/swagger'
import { IsImageAvailable } from '@app/src/shared/decorators'
import { ImagesEntity } from '@app/src/images/entities/images.entity'

export class DealPrizes {
  @ApiProperty({
    type: 'number',
    minimum: 1,
    maximum: 5,
    default: 1,
  })
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  readonly rank: number

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  readonly name: string

  @ApiProperty({
    type: 'number',
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  readonly number_of_winners: string

  @ApiProperty({
    type: [String],
    format: 'uuid',
    example: ['15d70949-793c-468a-8cfd-0f01325b25cc'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsImageAvailable(
    {
      message: 'Invalid image',
    },
    UploadType.DEAL,
  )
  readonly images: ImagesEntity[]
}
