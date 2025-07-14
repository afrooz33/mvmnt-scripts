import { IGatewayMetadataExtended } from '@app/shared/interfaces'

export default {
  handlePreflightRequest: (req, res) => {
    const headers = {
      'Access-Control-Allow-Headers': 'Authorization, x-lang',
      'Access-Control-Allow-Origin': req.headers.origin,
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Max-Age': '1728000',
      'Content-Length': '0',
    }

    res.writeHead(200, headers)
    res.end()
  },
} as IGatewayMetadataExtended
