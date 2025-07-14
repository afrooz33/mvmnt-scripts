import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'

export default function (): DonationProjectEntity {
  const responseObject: any = {
    id: this.id,
    display_order: Number(this.display_order),
    name: this.name,
    is_schedule: this.is_schedule,
    is_deadline_enabled: this.is_deadline_enabled,
    is_goal_set: this.is_goal_set,
    schedule_date: this.schedule_date,
    deadline_date: this.deadline_date,
    goal_amount: this.goal_amount,
    introduction: this.introduction,
    description: this.description,
    donation_presets: this.donation_presets,
    default_donation_preset_amount: this.default_donation_preset_amount,
    total_deals: Number(this.total_deals),
    total_active_deals: Number(this.total_active_deals),
    gross_donations: Number(this.gross_donations),
    total_donations: Number(this.total_donations),
    total_donors: Number(this.total_donors),
    total_deal_donations: Number(this.total_deal_donations),
    total_direct_donations: Number(this.total_direct_donations),
    total_re2_donations: Number(this.total_re2_donations),
    tags: this.tags,
    status: this.status,
    user: this.user,
    images: this.images,
    updated: this.updated,
    created: this.created,
  }

  if (this.user) {
    responseObject.user = this.user.toResponseObject()
  }

  if (this.user?.profile) {
    responseObject.user['profile'] = this.user.profile.toResponseObject()
  }

  if (this.images) {
    responseObject.images = this.images
  }

  return responseObject
}
