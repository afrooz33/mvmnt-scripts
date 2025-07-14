import { Column, Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { UserGrade } from '@app/src/users/grades/enums'
import BigNumber from 'bignumber.js'
import DecimalTransformer from '@app/src/shared/transformers/decimal.transformer'

@Entity('user_grade_history')
export class UserGradeHistoryEntity extends MyEntity {
  @ManyToOne(() => UserEntity, { cascade: true })
  @JoinColumn()
  @JoinTable()
  user: UserEntity

  @Column({
    type: 'enum',
    enum: Object.values(UserGrade),
    default: UserGrade.ContributorI,
  })
  grade: UserGrade

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  stars: BigNumber

  @Column('float')
  percentile: number
}
