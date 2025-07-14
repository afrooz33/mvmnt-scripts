import { DonationType } from '@app/src/donations/enums'
import { IntegrationType } from '@app/src/re2/integrations/enums'

export default interface IGetRe2DonationQueryArgs {
  id?: string
  select?: string
  isAll?: boolean
  re2Id?: string
  donationType?: DonationType[] | DonationType
  integrationType?: IntegrationType[] | IntegrationType
}
