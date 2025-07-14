import { Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { ShareEntity } from '@app/src/users/share/entities/share.entity'

@Entity('user_nonprofits_shares')
export class NonprofitShareEntity extends ShareEntity {
  @ManyToOne(() => NonprofitUserEntity)
  @JoinColumn()
  @JoinTable()
  nonprofit: NonprofitUserEntity
}
