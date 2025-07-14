import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class ImportCsvDto {
  @IsOptional()
  readonly type: string = 'deal'

  @ApiProperty({ type: 'file' })
  readonly file: any
}
