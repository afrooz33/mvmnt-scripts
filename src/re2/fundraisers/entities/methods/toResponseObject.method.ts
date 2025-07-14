interface Fundraiser {
  id: string
  type: string
  title: string
  status: string
  created: Date
  description: string
  nonprofit: any
  donation_projects: any
  net_donation: number
  gross_donation: number
  hex_page_color: string
  hex_form_color: string
  public_url: string
  goal_settings: string
  goal_amount: number
  start_date: Date
  end_date: Date
  donation_presets: any
  default_donation_preset_amount: number
  images: any
}

export default function (): Fundraiser {
  const responseObject: Partial<Fundraiser> = {
    id: this.id,
    type: this.type,
    title: this.title,
    status: this.status,
    created: this.created,
    description: this.description,
    net_donation: this.net_donation,
    gross_donation: this.gross_donation,
    hex_page_color: this.hex_page_color,
    hex_form_color: this.hex_form_color,
    public_url: this.public_url,
    goal_settings: this.goal_settings,
    goal_amount: this.goal_amount,
    start_date: this.start_date,
    end_date: this.end_date,
    donation_presets: this.donation_presets,
    default_donation_preset_amount: this.default_donation_preset_amount,
  }

  if (this.nonprofit) {
    responseObject.nonprofit = this.nonprofit.map((nonprofit) => ({
      id: nonprofit.id,
      foundation_name: nonprofit.profile.foundation_name,
      profile_image: nonprofit.profile.profile_image,
    }))
  }

  if (this.donation_projects) {
    responseObject.donation_projects = this.donation_projects.map((donationProject) => ({
      id: donationProject.id,
      name: donationProject.name,
    }))
  }

  if (this.images) {
    responseObject.images = this.images
  }

  return responseObject as Fundraiser
}
