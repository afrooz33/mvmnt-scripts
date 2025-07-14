import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { IntegrationType } from '@app/src/re2/integrations/enums'

export enum Re2DonationSourceType {
  API = IntegrationType.API,
  FORM = FundraiserType.FORM,
  PAGE = FundraiserType.PAGE,
  PAYPAL = IntegrationType.PAYPAL,
  STRIPE = IntegrationType.STRIPE,
  SHOPIFY = IntegrationType.SHOPIFY,
}
