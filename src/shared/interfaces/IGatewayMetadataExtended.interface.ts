import { GatewayMetadata } from '@nestjs/websockets'

export interface IGatewayMetadataExtended extends GatewayMetadata {
  handlePreflightRequest: (req, res) => void
}
