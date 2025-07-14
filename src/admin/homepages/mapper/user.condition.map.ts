import { Conditions, Fields } from '@app/src/admin/homepages/enums'

export const UserConditionRules = {
  [Fields.DEAL_NAME]: [Conditions.CONTAINS, Conditions.DOES_NOT_CONTAIN],
  [Fields.DEAL_BRAND]: [Conditions.CONTAINS],
  [Fields.DEAL_CATEGORY]: [Conditions.CONTAINS],
  [Fields.DEAL_TYPE]: [Conditions.CONTAINS, Conditions.DOES_NOT_CONTAIN],
  [Fields.USER_TYPE]: [Conditions.IS_EQUAL_TO, Conditions.IS_NOT_EQUAL_TO],
  [Fields.DONATED_TO]: [Conditions.CONTAINS, Conditions.DOES_NOT_CONTAIN],
  [Fields.DONATION_AMOUNT]: [Conditions.IS_GREATER_THAN, Conditions.IS_LESS_THAN],
  [Fields.CONTRIBUTION_AMOUNT]: [Conditions.IS_GREATER_THAN, Conditions.IS_LESS_THAN],
  [Fields.TOTAL_SALES]: [Conditions.IS_GREATER_THAN, Conditions.IS_LESS_THAN],
  [Fields.USER_MVMNT_FOLLOWERS]: [Conditions.IS_GREATER_THAN, Conditions.IS_LESS_THAN],
  [Fields.USER_SNS_FOLLOWERS]: [Conditions.IS_GREATER_THAN, Conditions.IS_LESS_THAN],
  [Fields.SORT_ORDER]: [
    Conditions.DONATION_AMOUNT_DESC,
    Conditions.DONATION_AMOUNT_ASC,
    Conditions.CONTRIBUTION_AMOUNT_DESC,
    Conditions.CONTRIBUTION_AMOUNT_ASC,
    Conditions.TOTAL_SALES_DESC,
    Conditions.TOTAL_SALES_ASC,
    Conditions.MVMNT_FOLLOWERS_DESC,
    Conditions.MVMNT_FOLLOWERS_ASC,
    Conditions.SNS_FOLLOWERS_DESC,
    Conditions.SNS_FOLLOWERS_ASC,
  ],
}
