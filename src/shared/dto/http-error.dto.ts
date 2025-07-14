import { ApiProperty } from '@nestjs/swagger'

export class HttpErrorDto {
  @ApiProperty()
  readonly statusCode: number

  @ApiProperty()
  readonly timestamp: string

  @ApiProperty()
  readonly path: string

  @ApiProperty()
  readonly method: string

  @ApiProperty()
  readonly error: string

  @ApiProperty()
  readonly message: string
}
