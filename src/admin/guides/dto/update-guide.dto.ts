import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsDefined, IsUUID } from 'class-validator'
import { CreateGuideDto } from './create-guide.dto'

export class UpdateGuideDto extends CreateGuideDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: '8b4d48a4-590d-47d3-ab22-219f2c496ce9',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  readonly id: string
}
