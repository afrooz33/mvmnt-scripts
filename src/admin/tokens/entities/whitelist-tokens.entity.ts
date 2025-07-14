import { Column, Entity } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'

@Entity('tokens_whitelist')
export class TokenWhitelistEntity extends MyEntity {
  @Column()
  chain_id: number

  @Column({ unique: true })
  address: string

  @Column()
  name: string

  @Column({ nullable: true })
  logo_uri: string

  @Column({ default: 18 })
  decimals: number

  @Column()
  coin_market_cap_id: number

  @Column({ type: 'boolean', default: true })
  is_whitelisted: boolean
}
