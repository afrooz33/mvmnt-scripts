import { Request } from 'express'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Strategy } from 'passport-strategy'
import { PassportStrategy } from '@nestjs/passport'
import { ErrorKey } from '@app/src/shared/enums'
import { IncomingHttpHeaders } from 'http'
import { ethers } from 'ethers'

@Injectable()
export class SubgraphStrategy extends PassportStrategy(Strategy, 'subgraph') {
  private subgraph_address: string

  constructor(private readonly configService: ConfigService) {
    super()
    this.subgraph_address = this.configService.getOrThrow('blockchain.subgraphPublicKey')
  }

  async authenticate(request: Request) {
    try {
      //  1: Extract and validate Headers
      const { signature } = this.extractHeaders(request.headers)
      if (!signature) return this.fail({ message: ErrorKey.MISSING_HEADERS }, 400)

      try {
        //  2: Verify the signature
        const rawBody = request['rawBody']
        const message = rawBody || JSON.stringify(request.body)
        const hashedMessage = ethers.hashMessage(message)

        const signerAddress = ethers.verifyMessage(hashedMessage, signature)

        //  3: Authenticate the signer
        if (signerAddress.toLowerCase() !== this.subgraph_address.toLowerCase()) {
          return this.fail({ message: ErrorKey.UNAUTHORIZED }, 401)
        }

        //  4: Validate Expiry
        this.validateExpiry(request.body.timestamp)

        return this.success({ ...request.body })
      } catch (err) {
        return this.fail({ message: `Signature verification failed: ${err.message}` }, 500)
      }
    } catch (error) {
      console.log('Unknown error in Subgraph strategy', error)
      return this.fail({ message: error.message }, 500)
    }
  }

  private validateExpiry = (timestamp: number) => {
    const currentTime = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    if (!timestamp || Math.abs(currentTime - timestamp) > fiveMinutes)
      throw new Error(ErrorKey.UNAUTHORIZED)
  }

  private extractHeaders = (headers: IncomingHttpHeaders) => {
    const signature: string = headers['x-signature'] as string

    return {
      signature,
    }
  }
}
