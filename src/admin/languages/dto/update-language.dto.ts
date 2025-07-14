import { IsDefined, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { CreateLanguageDto } from './create-language.dto'

export class UpdateLanguageDto extends CreateLanguageDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsDefined()
  readonly id: string
}
