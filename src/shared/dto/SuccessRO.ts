import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SuccessRO {
  @ApiProperty()
  readonly success: boolean

  @ApiPropertyOptional()
  readonly data?: any

  @ApiProperty()
  readonly message: string
}
