import { SuccessRO } from '@app/src/shared/dto'
import { UpdateVaultDto } from '@app/src/nonprofit/donation-projects/dto'
import { uuidFromUniqueId } from '@app/src/users/payment/methods/uuid.methods'

async function updateVault(payload: UpdateVaultDto): Promise<SuccessRO> {
  await this.donationProjectRepository.update(
    {
      id: uuidFromUniqueId(payload.project_id),
    },
    {
      vault_address: payload.vault_address,
    },
  )

  return {
    message: 'Successfully updated Vault Address',
    success: true,
  }
}

export default updateVault
