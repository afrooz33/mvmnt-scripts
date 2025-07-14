import { Column, Entity, JoinTable, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DealOptionValueEntity } from './deal-option-value.entity'

@Entity('deal_options')
export class DealOptionEntity extends MyEntity {
  @Column({
    type: 'varchar',
    length: 15,
    nullable: false,
    unique: true,
    transformer: {
      to: (value: string) => value.toUpperCase(),
      from: (value: string) => value,
    },
  })
  type: string

  @OneToMany(() => DealOptionValueEntity, (value) => value.option)
  @JoinTable()
  values: DealOptionValueEntity[]
}
