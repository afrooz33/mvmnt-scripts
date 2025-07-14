import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { CreateShippingFeeTemplateDto } from './create-template.dto'

export class UpdateShippingFeeTemplateDto extends CreateShippingFeeTemplateDto {
  @ApiProperty({
    name: 'id',
    description: 'Template id',
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string
}
