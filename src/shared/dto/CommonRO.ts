import { ApiProperty } from '@nestjs/swagger'

export class CommonRO {
  @ApiProperty()
  readonly created: Date

  @ApiProperty()
  readonly updated: Date
}
