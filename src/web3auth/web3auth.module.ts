import { Module } from '@nestjs/common'
import { Web3AuthService } from './web3auth.service'

@Module({
  providers: [Web3AuthService],
  exports: [Web3AuthService],
})
export class Web3AuthModule {}
