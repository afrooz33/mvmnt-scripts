import { Response } from 'express'
import * as crypto from 'node:crypto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function (res: Response, code: string, cookieKey: string): Promise<void> {
  try {
    const algorithm = 'aes-256-cbc'
    const key = process.env.COOKIE_ENCRYPT_SECRET

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv)

    let encryptedCode = cipher.update(code, 'utf8', 'hex')
    encryptedCode += cipher.final('hex')

    const encryptedDataWithIV = iv.toString('hex') + encryptedCode

    /**
     * Set the cookie with a maximum age of one day (86400000 milliseconds)
     * httpOnly: true means the cookie is only accessible by the server
     * secure: true means the cookie is only sent over HTTPS
     */
    res.cookie(cookieKey, encryptedDataWithIV, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })

    return
  } catch (error) {
    return HandleErrors(error)
  }
}
