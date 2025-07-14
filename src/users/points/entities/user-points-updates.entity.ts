import { Column, Entity, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { POINTS_STATUS } from '@app/src/users/points/enums'
import { UserPointsEntity } from './user-points.entity'

@Entity('user_point_updates')
export class UserPointUpdatesEntity extends MyEntity {
  @ManyToOne(() => UserPointsEntity, (user_point) => user_point.updates)
  user_point: UserPointsEntity

  @Column({
    type: 'enum',
    enum: Object.values(POINTS_STATUS),
    default: POINTS_STATUS.LOCKED,
  })
  status: POINTS_STATUS

  @Column('json')
  notes: object
}
