import { ContentResponseObject } from '@app/src/admin/homepages/interfaces'

export default function (): ContentResponseObject {
  const responseObject: any = {
    id: this.id,
  }

  if (this.user?.id) {
    responseObject.user = {
      id: this.user.id,
      username: this.user.username,
      display_name: this.user.display_name,
      profile: {
        id: this.user.profile.id,
        social_accounts: this.user.profile.social_accounts,
        profile_images: this.user.profile.profile_images,
      },
    }
  }

  if (this.brand?.id) {
    responseObject.brand = {
      id: this.brand.id,
      name: this.brand.name,
      translations: this.brand.translations,
    }
  }

  if (this.deal?.id) {
    responseObject.deal = {
      id: this.deal.id,
      name: this.deal.name,
      deal_type: this.deal.deal_type,
      deal_image: this.deal.deal_image,
    }
  }

  if (this.category?.id) {
    responseObject.category = {
      id: this.category.id,
      name: this.category.name,
      translations: this.category.translations,
    }
  }

  return responseObject
}
