import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class AdminNotesDto {
  @ApiProperty({
    description: 'Admin notes for the brand token request',
    example: 'Request approved after reviewing documentation',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Admin notes are required' })
  @IsString()
  @MaxLength(500, { message: 'Admin notes cannot exceed 500 characters' })
  readonly admin_notes: string
}
