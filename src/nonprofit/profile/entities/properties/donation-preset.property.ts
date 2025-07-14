import { Column } from 'typeorm'

export class DonationPreset {
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  presets: number[]
}
