import { Column, Entity, JoinTable, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DealOptionEntity } from './deal-option.entity'

@Entity('deal_option_values')
export class DealOptionValueEntity extends MyEntity {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  value: string

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  label_name: string

  @ManyToOne(() => DealOptionEntity, (option) => option.values)
  @JoinTable()
  option: DealOptionEntity
}
