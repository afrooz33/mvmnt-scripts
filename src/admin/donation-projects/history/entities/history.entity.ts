import { Column, Entity, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { HistoryStatus } from '@app/src/admin/donation-projects/history/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

@Entity('donation_project_history')
export class HistoryEntity extends MyEntity {
  @Column({
    type: 'enum',
    enum: Object.values(DonationProjectStatus),
    default: DonationProjectStatus.DRAFT,
  })
  donation_project_status?: DonationProjectStatus

  @Column({
    type: 'enum',
    enum: Object.values(HistoryStatus),
    default: HistoryStatus.AWAITING_ACTIVATION,
  })
  status: HistoryStatus

  @ManyToOne(() => DonationProjectEntity, (donation_project) => donation_project.history)
  donation_projects: DonationProjectEntity
}
