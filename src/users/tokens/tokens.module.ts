import { Module } from '@nestjs/common'
import { TokensController } from './tokens.controller'
import { TokensModule as AdminTokensModule } from '@app/src/admin/tokens/tokens.module'

@Module({
  imports: [AdminTokensModule],
  controllers: [TokensController],
})
export class TokensModule {}
