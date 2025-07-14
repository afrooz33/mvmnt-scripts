import axios from 'axios'

export class OauthGoogle {
  static async getProfile(accessToken: string) {
    const { data } = await axios({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return data
  }

  static async getAccessToken(code: string) {
    const { data } = await axios({
      url: `https://oauth2.googleapis.com/token`,
      method: 'post',
      data: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.SNS_CALLBACK_URL}/users/profile/google/callback`,
        grant_type: 'authorization_code',
        code,
      },
    })

    return data
  }

  static async getLoginUrl(userId: string): Promise<string> {
    const queryString = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${process.env.SNS_CALLBACK_URL}/users/profile/google/callback`,
      scope: [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/youtube.readonly',
      ].join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state: userId,
    }).toString()

    return `https://accounts.google.com/o/oauth2/v2/auth?${queryString}`
  }
}
