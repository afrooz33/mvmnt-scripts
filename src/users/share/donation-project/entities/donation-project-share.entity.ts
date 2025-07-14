import { Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm'
import { ShareEntity } from '@app/src/users/share/entities/share.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'

@Entity('user_donation_projects_shares')
export class DonationProjectShareEntity extends ShareEntity {
  @ManyToOne(() => DonationProjectEntity)
  @JoinColumn()
  @JoinTable()
  donation_project: DonationProjectEntity
}
