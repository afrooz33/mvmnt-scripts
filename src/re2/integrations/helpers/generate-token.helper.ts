import { createCipheriv } from 'node:crypto'

export default async function GenerateRe2DashboardToken(): Promise<string> {
  const cipher = createCipheriv(
    'aes-256-cbc',
    process.env.SHOP_SESSION_AES_SECRET,
    process.env.SHOP_SESSION_AES_IV,
  )

  const currentTimestamp = Math.floor(Date.now() / 1000).toString()

  let encrypted = cipher.update(currentTimestamp, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return encrypted
}
