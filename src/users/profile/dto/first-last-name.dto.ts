import { ApiPropertyOptional } from '@nestjs/swagger'

export class FirstLastName {
  @ApiPropertyOptional({
    description: 'User first name',
    nullable: false,
    type: 'string',
    example: 'John',
  })
  readonly first_name: string

  @ApiPropertyOptional({
    description: 'User last name',
    nullable: false,
    type: 'string',
    example: 'Doe',
  })
  readonly last_name: string
}
