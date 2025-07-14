import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class CreateDealVariantOptionDto {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  name: string
}
