import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsOptional } from 'class-validator'

export class DeleteFollowerDto {
  @ApiProperty({
    description: 'User id',
    example: '59c05574-b257-4f8a-8c69-e82c2221a34d',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsDefined()
  following: string

  @IsOptional()
  follower: string
}
