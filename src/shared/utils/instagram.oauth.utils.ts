import { InstagramResponse } from '@app/src/shared/interfaces'
import axios from 'axios'

export class OauthInstagram {
  static async getLoginUrl(userId: string): Promise<string> {
    const queryString = new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID,
      redirect_uri: `${process.env.SNS_CALLBACK_URL}/users/profile/instagram/callback`,
      scope: ['user_media', 'user_profile'].join(','),
      response_type: 'code',
      state: userId,
    }).toString()

    return `https://api.instagram.com/oauth/authorize?${queryString}`
  }

  static async getAccessToken(code: string) {
    const { data } = await axios({
      url: `https://api.instagram.com/oauth/access_token`,
      method: 'POST',
      data: {
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.SNS_CALLBACK_URL}/users/profile/instagram/callback`,
        code,
      },
      headers: {
        'content-type': 'multipart/form-data',
        host: 'api.instagram.com',
      },
    })

    return data
  }

  static async getProfile(accessToken: string): Promise<InstagramResponse> {
    const { data } = await axios({
      url: 'https://graph.instagram.com/me',
      method: 'GET',
      data: {
        fields: ['id', 'username', 'media_count', 'account_type'].join(','),
        access_token: accessToken,
      },
    })

    return data
  }
}
