import { ApiProperty } from '@nestjs/swagger'

export class PaginateMetaRO {
  @ApiProperty({ example: 5 })
  readonly total_page: number

  @ApiProperty({ example: 2 })
  readonly current_page: number

  @ApiProperty({ example: 10 })
  readonly limit: number

  @ApiProperty({
    example: 'http://localhost:3000/api/v1/endpoint?page=3&limit=10',
  })
  readonly next_page?: string

  @ApiProperty({
    example: 'http://localhost:3000/api/v1/endpoint?page=1&limit=10',
  })
  readonly prev_page?: string

  @ApiProperty({ example: 15 })
  readonly total_record?: number
}
