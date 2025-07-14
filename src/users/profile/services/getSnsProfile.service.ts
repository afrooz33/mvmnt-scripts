import { OauthFacebook, OauthGoogle, OauthTwitter, OauthInstagram } from '@app/src/shared/utils'
import { SnsProviderDto } from '@app/src/users/profile/dto'
import { SnsProvider } from '@app/src/users/profile/enums'

export default async function (params: SnsProviderDto, payload: any) {
  let SnsProfile: unknown

  if (params.provider === SnsProvider.FACEBOOK) {
    const fbData = await OauthFacebook.getAccessToken(payload.code)

    const fbProfile = await OauthFacebook.getProfile(fbData.access_token)

    SnsProfile = {
      id: fbProfile.id,
      email: fbProfile.email,
      name: fbProfile.name,
      picture: fbProfile.picture ? fbProfile.picture?.data?.url : '',
      friends: fbProfile.friends ? fbProfile.friends?.summary?.total_count : 0,
    }
  } else if (params.provider === SnsProvider.GOOGLE) {
    const googleData = await OauthGoogle.getAccessToken(payload.code)

    const googleProfile = await OauthGoogle.getProfile(googleData.access_token)

    SnsProfile = {
      id: googleProfile.id,
      email: googleProfile.email,
      given_name: googleProfile.given_name,
      family_name: googleProfile.family_name,
      picture: googleProfile.picture,
      access_token: googleData.access_token,
    }
  } else if (params.provider === SnsProvider.TWITTER) {
    const twitterData = await OauthTwitter.getAccessToken(payload.code)

    const twitterProfile = await OauthTwitter.getProfile(twitterData.access_token)

    SnsProfile = {
      id: twitterProfile.id,
      name: twitterProfile.name,
      username: twitterProfile.username,
    }
  } else if (params.provider === SnsProvider.INSTAGRAM) {
    const instagramData = await OauthInstagram.getAccessToken(payload.code)

    const instagramProfile = await OauthInstagram.getProfile(instagramData.access_token)

    SnsProfile = {
      id: instagramProfile.id,
      username: instagramProfile.username,
      media_count: instagramProfile.media_count,
      account_type: instagramProfile.account_type,
    }
  }

  return SnsProfile
}
