import { DonationType } from '@app/src/donations/enums'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { IntegrationType } from '@app/src/re2/integrations/enums'
import { IntegrationSettingType } from '@app/src/re2/integrations/enums'

export default interface IRe2QueryArgs {
  dateFilter?: {
    end?: string
    start?: string
  }
  re2?: string
  field?: string
  alias?: string
  select?: string
  isGross?: boolean
  reference?: string
  isFundraiser?: boolean
  isIntegration?: boolean
  reason?: DonationType[] | DonationType | null
  fundraiserType?: FundraiserType[] | FundraiserType | null
  integrationType?: IntegrationType[] | IntegrationType | null
  shopifyIntegrationType?: IntegrationSettingType[] | IntegrationSettingType | null
}
