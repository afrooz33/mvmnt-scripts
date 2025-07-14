import { Injectable } from '@nestjs/common'
import * as jose from 'jose'
import { toBuffer, pubToAddress } from 'ethereumjs-util'
import { ethers } from 'ethers'

@Injectable()
export class Web3AuthService {
  private readonly JWKS_EXTERNAL = 'https://authjs.web3auth.io/jwks'
  private readonly JWKS_SOCIAL = 'https://api-auth.web3auth.io/jwks'

  /**
   * Validate the idToken and return the Wallet Address
   */
  validateSocialLogin = async (idToken: string, app_pub_key: string) => {
    const jwks = jose.createRemoteJWKSet(new URL(this.JWKS_SOCIAL))
    const jwtDecoded = await jose.jwtVerify(idToken, jwks, { algorithms: ['ES256'] })

    //  Verify if the Payload matches the public key
    if (
      (jwtDecoded.payload as any).wallets[0].public_key.toLowerCase() != app_pub_key.toLowerCase()
    ) {
      return null
    }

    return this.getWalletAddress(app_pub_key)
  }

  /**
   * Validate the wallet signature
   */
  validateWalletSignature = (message: string, signature: string, pubKey: string) => {
    // 1. Validate input
    if (!message || !signature || !pubKey) {
      return null
    }

    // 2. Verify the signature (this proves the user owns the private key)
    try {
      const signerAddress = ethers.verifyMessage(message, signature)

      // 3. Derive the address from the public key and compare
      const addressFromPubKey = this.getWalletAddressFromPublicKey(pubKey)

      // 4. Ensure both addresses match
      if (signerAddress.toLowerCase() !== addressFromPubKey.toLowerCase()) {
        return null
      }

      return addressFromPubKey
    } catch (error) {
      throw new Error('Invalid signature')
    }
  }

  getWalletAddressFromPublicKey(compressedPublicKey: string): string {
    // Remove '0x' prefix if present
    const pubKeyHex = compressedPublicKey.startsWith('0x')
      ? compressedPublicKey.slice(2)
      : compressedPublicKey

    // Ethereum addresses are derived from the keccak256 hash of the uncompressed public key
    // For this example, we'll use a simplified approach for compressed keys
    try {
      // Create a public key object from the compressed public key
      const publicKey = ethers.computeAddress(`0x${pubKeyHex}`)
      return publicKey
    } catch (error) {
      throw new Error('Invalid public key')
    }
  }

  /**
   * Validate the idToken and return the Wallet Address
   */
  validateExternalWallet = async (idToken: string, publicAddress: string) => {
    const jwks = jose.createRemoteJWKSet(new URL(this.JWKS_EXTERNAL))
    const jwtDecoded = await jose.jwtVerify(idToken, jwks, { algorithms: ['ES256'] })

    //  Verify if the Payload matches the Public Address
    if (
      (jwtDecoded.payload as any).wallets[0].address.toLowerCase() != publicAddress.toLowerCase()
    ) {
      return null
    }

    return publicAddress
  }

  private getWalletAddress = (publicKey: string) => {
    if (!publicKey.startsWith('0x')) {
      publicKey = '0x' + publicKey
    }

    const addressBuffer = pubToAddress(toBuffer(publicKey), true)
    return '0x' + addressBuffer.toString('hex')
  }
}
