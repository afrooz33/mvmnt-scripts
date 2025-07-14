import { IsString, IsBoolean, IsNotEmpty, IsEnum, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreatePoolDto {
  @ApiProperty({
    description: 'The brand ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  brandId: string
}

export class AddLiquidityDto {
  @ApiProperty({
    description: 'The brand ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  brandId: string

  @ApiProperty({
    description: 'The amount of brand tokens to add',
    example: '0.01',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+\.?[0-9]*$/, {
    message: 'tokenAmount must be a valid decimal string',
  })
  tokenAmount: string

  @ApiProperty({
    description: 'The amount of stablecoins to add',
    example: '0.0317',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+\.?[0-9]*$/, {
    message: 'stableAmount must be a valid decimal string',
  })
  stableAmount: string

  @ApiProperty({
    description: 'The minimum amount of LP tokens to receive',
    example: '0.0099',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+\.?[0-9]*$/, {
    message: 'minLpAmount must be a valid decimal string',
  })
  minLpAmount: string
}

export class RemoveLiquidityDto {
  @ApiProperty({
    description: 'The brand ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  brandId: string

  @ApiProperty({
    description: 'The amount of LP tokens to burn',
    example: '1000000000000000000',
  })
  @IsString()
  @IsNotEmpty()
  lpAmount: string

  @ApiProperty({
    description: 'The minimum amount of brand tokens to receive',
    example: '0',
  })
  @IsString()
  @IsNotEmpty()
  minTokenAmount: string

  @ApiProperty({
    description: 'The minimum amount of stablecoins to receive',
    example: '0',
  })
  @IsString()
  @IsNotEmpty()
  minStableAmount: string
}

export class SwapDto {
  @ApiProperty({
    description: 'The brand ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  brandId: string

  @ApiProperty({
    description: 'True for buying token, false for selling',
    example: true,
  })
  @IsBoolean()
  isBuyToken: boolean

  @ApiProperty({
    description: 'Input amount in wei',
    example: '1000000',
  })
  @IsString()
  @IsNotEmpty()
  amountIn: string

  @ApiProperty({
    description: 'Minimum output amount in wei',
    example: '900000',
  })
  @IsString()
  @IsNotEmpty()
  minAmountOut: string
}

export class ClaimFeesDto {
  @ApiProperty({
    description: 'The brand ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  brandId: string

  @ApiProperty({
    description: 'Type of fees to claim',
    enum: ['lpProvider', 'lpStaker', 'btStaker'],
    example: 'lpProvider',
  })
  @IsEnum(['lpProvider', 'lpStaker', 'btStaker'])
  feeType: 'lpProvider' | 'lpStaker' | 'btStaker'
}
