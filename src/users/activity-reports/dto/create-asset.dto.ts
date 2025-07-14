import { Express } from 'express'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsDefined } from 'class-validator'

export class CreateAssetDto {
  @ApiProperty({ type: 'formdata', default: false, example: true })
  @IsBoolean()
  @IsDefined()
  @Transform(({ obj, key }) => {
    const value = obj[key]

    if (typeof value === 'string') {
      return obj[key] === 'true'
    }

    return value
  })
  readonly is_featured: boolean

  @ApiProperty({ type: 'file' })
  readonly file: Express.Multer.File
}
