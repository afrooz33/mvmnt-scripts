import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { CreateTemplateDto } from './'

export class UpdateTemplateDto extends CreateTemplateDto {
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
