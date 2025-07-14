import { Response } from 'express'
import { json } from 'body-parser'

import { RequestWithRawBody } from 'src/shared/interfaces'

function RawBodyMiddleware() {
  return json({
    verify: (request: RequestWithRawBody, response: Response, buffer: Buffer) => {
      if (request.url === '/api/v1/user/donations/stripe/webhooks' && Buffer.isBuffer(buffer)) {
        request.rawBody = Buffer.from(buffer)
      }

      return true
    },
  })
}

export default RawBodyMiddleware
