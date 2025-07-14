import { Request } from 'express'
import * as crypto from 'node:crypto'
export default async function decodeCookie(req: Request, code: string): Promise<string> {
  const algorithm = 'aes-256-cbc'
  const key = process.env.COOKIE_ENCRYPT_SECRET

  const encryptedDataWithIV = req.cookies[code]

  if (!encryptedDataWithIV) {
    return null
  }

  const iv = Buffer.from(encryptedDataWithIV.slice(0, 32), 'hex')
  const encryptedCode = encryptedDataWithIV.slice(32)

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv)

  let decryptedCode = decipher.update(encryptedCode, 'hex', 'utf8')
  decryptedCode += decipher.final('utf8')

  return decryptedCode
}
