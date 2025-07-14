import { ApiProperty } from '@nestjs/swagger'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from 'class-validator'

export class DeleteRecordDto {
  @ApiProperty({
    isArray: true,
    format: 'uuid',
  })
  @IsArray()
  @IsUUID('all', { each: true, message: 'Invalid resource id.' })
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  readonly ids: string[]
}
