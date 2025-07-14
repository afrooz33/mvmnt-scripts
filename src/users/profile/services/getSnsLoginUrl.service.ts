import { OauthFacebook, OauthGoogle, OauthTwitter, OauthInstagram } from '@app/src/shared/utils'
import { SnsProviderDto } from '@app/src/users/profile/dto'
import { SnsProvider } from '@app/src/users/profile/enums'

export default async function (params: SnsProviderDto): Promise<string> {
  let snsLoginUrl: string

  switch (params.provider) {
    case SnsProvider.FACEBOOK:
      snsLoginUrl = await OauthFacebook.getLoginUrl(params.id)
      break
    case SnsProvider.GOOGLE:
      snsLoginUrl = await OauthGoogle.getLoginUrl(params.id)
      break
    case SnsProvider.TWITTER:
      snsLoginUrl = await OauthTwitter.getLoginUrl(params.id)
      break
    case SnsProvider.INSTAGRAM:
      snsLoginUrl = await OauthInstagram.getLoginUrl(params.id)
      break
    default:
      snsLoginUrl = ''
  }

  return snsLoginUrl
}
