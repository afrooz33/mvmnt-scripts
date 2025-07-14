import { DealProperty } from '@app/src/shared/enums'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'
import { FundraiserStatus } from '@app/src/re2/fundraisers/enums'

export enum DonationSourceStatus {
  ENDED = DealProperty.ENDED,
  DRAFT = DealProperty.DRAFT,
  HIDDEN = DealProperty.HIDDEN,
  DELETED = DealProperty.DELETED,
  ON_DEAL = DealProperty.ON_DEAL,
  UNLISTED = DealProperty.UNLISTED,
  DECLINED = DealProperty.DECLINED,
  SUSPENDED = DealProperty.SUSPENDED,
  SCHEDULED = DealProperty.SCHEDULED,
  ENABLED = IntegrationStatus.ENABLED,
  TERMINATED = DealProperty.TERMINATED,
  PUBLISHED = FundraiserStatus.PUBLISHED,
  CONFIRMED = FundraiserStatus.CONFIRMED,
  ON_REVIEW = FundraiserStatus.ON_REVIEW,
  DELETE_REQUESTED = DealProperty.DELETE_REQUESTED,
}
