import { Contract, Signer } from 'ethers'
import { GovernanceContract } from '../interfaces/governance-contract.interface'
import { getProvider } from './provider'
import { GOVERNANCE_ABI } from '../abi/governance.abi'

const GOVERNANCE_MANAGER = process.env.GOVERNANCE_MANAGER

export function getContract(): GovernanceContract {
  const provider = getProvider()
  return new Contract(GOVERNANCE_MANAGER, GOVERNANCE_ABI, provider) as unknown as GovernanceContract
}

export async function getSigner(): Promise<Signer> {
  // This function is not used in server-side code
  // For server-side, use the getSigner from signer.ts instead
  throw new Error('Browser signer not available in server environment')
}
