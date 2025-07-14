import axios from 'axios'
import { TwitterUser, TwitterTokenResponse } from '@app/src/shared/interfaces'

export class OauthTwitter {
  static async getProfile(accessToken: string) {
    const { data } = await axios.get<{ data: TwitterUser }>('https://api.twitter.com/2/users/me', {
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return data.data ?? null
  }

  static async getAccessToken(code: string) {
    const BasicAuthToken = Buffer.from(
      `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`,
      'utf8',
    ).toString('base64')

    const twitterOauthTokenParams = {
      client_id: process.env.TWITTER_CLIENT_ID,
      code_verifier: '8KxxO-RPl0bLSxX5AWwgdiFbMnry_VOKzFeIlVA7NoA',
      redirect_uri: `${process.env.SNS_CALLBACK_URL}/users/profile/twitter/callback`,
      grant_type: 'authorization_code',
    }

    const { data } = await axios.post<TwitterTokenResponse>(
      'https://api.twitter.com/2/oauth2/token',
      new URLSearchParams({ ...twitterOauthTokenParams, code }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${BasicAuthToken}`,
        },
      },
    )

    return data
  }

  static async getLoginUrl(userId: string): Promise<string> {
    const rootUrl = 'https://twitter.com/i/oauth2/authorize'
    const options = {
      redirect_uri: `${process.env.SNS_CALLBACK_URL}/users/profile/twitter/callback`,
      client_id: process.env.TWITTER_CLIENT_ID,
      state: userId,
      response_type: 'code',
      code_challenge: 'y_SfRG4BmOES02uqWeIkIgLQAlTBggyf_G7uKT51ku8',
      code_challenge_method: 'S256',
      scope: ['users.read', 'tweet.read', 'follows.read', 'follows.write'].join(' '),
    }

    const qs = new URLSearchParams(options).toString()

    return `${rootUrl}?${qs}`
  }
}
