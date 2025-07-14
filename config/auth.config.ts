export default () => ({
  auth: {
    jwt: {
      access: {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || '24h',
      },
      refresh: {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
      },
      privateKeyPath: process.env.JWT_PRIVATE_KEY_PATH,
      kid: process.env.JWT_KID,
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
      jwks: process.env.JWT_JWKS_URI,
    },

    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
})
