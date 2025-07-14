import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { TemplateStatus } from '@app/src/users/deal/template/enums'

@Entity('deal_templates')
export class TemplateEntity extends MyEntity {
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  title: string

  @Column({ type: 'text', nullable: false })
  content: string

  @Column({
    type: 'enum',
    enum: Object.values(TemplateStatus),
    default: TemplateStatus.ACTIVE,
    nullable: false,
  })
  status: TemplateStatus

  @ManyToOne(() => UserEntity, (user) => user.templates)
  @JoinColumn()
  user: UserEntity
}
