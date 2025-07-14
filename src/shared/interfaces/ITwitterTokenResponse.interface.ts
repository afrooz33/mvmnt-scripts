export default interface TwitterTokenResponse {
  token_type: 'bearer'
  expires_in: 7200
  access_token: string
  scope: string
}
