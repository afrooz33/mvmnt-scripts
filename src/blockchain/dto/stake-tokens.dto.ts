import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator'

export class StakeTokensDto {
  @ApiProperty({
    description: 'The brand ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  brandId: string

  @ApiProperty({
    description: 'The amount of tokens to stake',
    example: '10',
  })
  @IsNotEmpty()
  @IsString()
  amount: string

  @ApiProperty({
    description: 'The lock period in days',
    example: 30,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  lockPeriodDays: number

  @ApiProperty({
    description: 'The wallet address of the user',
    example: '0x45b95E19dCBB82574221A32CB83483A3278F737f',
  })
  @IsNotEmpty()
  @IsString()
  walletAddress: string
}

export class ApproveLPTokensDto {
  @ApiProperty({
    description: 'The brand ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  brandId: string

  @ApiProperty({
    description: 'The amount of LP tokens to approve',
    example: '10',
  })
  @IsNotEmpty()
  @IsString()
  amount: string

  @ApiProperty({
    description: 'The wallet address of the user',
    example: '0x45b95E19dCBB82574221A32CB83483A3278F737f',
  })
  @IsNotEmpty()
  @IsString()
  walletAddress: string
}
