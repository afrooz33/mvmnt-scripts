// src/blockchain/interfaces/pool.interface.ts
import { BigNumberish } from 'ethers'

export interface IPool {
  brandToken(): Promise<string>
  stablecoin(): Promise<string>
  manager(): Promise<string>
  brandId(): Promise<BigNumberish>
  fee(): Promise<BigNumberish>
  tokenReserve(): Promise<BigNumberish>
  stableReserve(): Promise<BigNumberish>
  totalSupply(): Promise<BigNumberish>
  referencePrice(): Promise<BigNumberish>
  lastReferenceUpdate(): Promise<BigNumberish>

  initialize(
    brandToken: string,
    stablecoin: string,
    brandId: BigNumberish,
    manager: string,
  ): Promise<void>

  addLiquidity(
    tokenAmount: string,
    stableAmount: string,
    minLpAmount: string,
    sender: string,
  ): Promise<bigint>

  removeLiquidity(
    lpAmount: string,
    minTokenAmount: string,
    minStableAmount: string,
  ): Promise<[bigint, bigint]>

  getPriceInfo(): Promise<{
    currentPrice: BigNumberish
    refPrice: BigNumberish
    lowerBound: BigNumberish
    upperBound: BigNumberish
    nextUpdate: BigNumberish
  }>

  getCurrentPrice(): Promise<BigNumberish>
  getPriceBounds(): Promise<[BigNumberish, BigNumberish]>
  updateReferencePrice(): Promise<boolean>
  swap(
    isBuyToken: boolean,
    amountIn: BigNumberish,
    minAmountOut: BigNumberish,
  ): Promise<BigNumberish>
  getAmountOut(isBuyToken: boolean, amountIn: BigNumberish): Promise<BigNumberish>
  setFee(newFee: BigNumberish): Promise<void>
  pause(): Promise<void>
  unpause(): Promise<void>
  balanceOf(account: string): Promise<BigNumberish>
  transfer(to: string, amount: BigNumberish): Promise<boolean>
  allowance(owner: string, spender: string): Promise<BigNumberish>
  transferFrom(token: string, from: string, to: string, amount: string): Promise<boolean>
  emergencyWithdraw(token: string, to: string, amount: BigNumberish): Promise<void>
}
