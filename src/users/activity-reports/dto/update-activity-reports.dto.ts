import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { CreateActivityReportsDto } from './create-activity-reports.dto'

export class UpdateActivityReportsDto extends CreateActivityReportsDto {
  @ApiProperty({
    description: 'The id of the activity report',
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string
}
