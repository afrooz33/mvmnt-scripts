import { Entity, Column } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'

@Entity('activity_report_assets')
export class ActivityReportAssetsEntity extends MyEntity {
  @Column({ type: 'varchar', length: 255 })
  filename: string

  @Column({ type: 'text' })
  url: string

  @Column({ type: 'varchar', length: 100 })
  mime_type: string

  @Column({ type: 'boolean', default: false })
  is_featured: boolean
}
