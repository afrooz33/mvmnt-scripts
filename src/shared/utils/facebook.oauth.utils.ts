import axios from 'axios'

export class OauthFacebook {
  static async getProfile(accessToken: string) {
    const { data } = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture,friends&access_token=${accessToken}`,
    )

    return data
  }

  static async getAccessToken(code: string) {
    const { data } = await axios.get(
      `https://graph.facebook.com/v16.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.SNS_CALLBACK_URL}/users/profile/facebook/callback&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`,
    )

    return data
  }

  static async getLoginUrl(userId: string): Promise<string> {
    const queryString = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID,
      redirect_uri: `${process.env.SNS_CALLBACK_URL}/users/profile/facebook/callback`,
      scope: ['email', 'user_friends'].join(','),
      response_type: 'code',
      auth_type: 'rerequest',
      display: 'popup',
      state: userId,
    }).toString()

    return `https://www.facebook.com/v16.0/dialog/oauth?${queryString}`
  }
}
