import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ImagesEntity } from '@app/src/images/entities/images.entity'

@Entity('brand_tokens')
export class BrandTokenEntity extends MyEntity {
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  user: UserEntity

  @Column({ type: 'varchar', length: 50 })
  name: string

  @Column({ type: 'varchar', length: 10 })
  symbol: string

  @Column({ type: 'text' })
  short_description: string

  @Column({ type: 'text' })
  introduction: string

  @ManyToOne(() => ImagesEntity, { nullable: true })
  @JoinColumn()
  logo: ImagesEntity

  @Column({ type: 'varchar', nullable: true })
  website_url: string

  @Column({ type: 'varchar', nullable: true })
  telegram_account: string

  @Column({ type: 'varchar', nullable: true })
  x_account: string

  @Column({ type: 'varchar', nullable: true })
  discord_account: string

  @Column({ type: 'bigint', default: 0 })
  total_supply: string

  @Column({ type: 'bigint', default: 0 })
  remaining_tokens: string

  @Column({ type: 'varchar', length: 42, nullable: true })
  contract_address: string

  @Column({ type: 'boolean', default: false })
  is_deployed: boolean
}
