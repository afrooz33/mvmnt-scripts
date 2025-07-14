import { StarActionType } from '@app/src/users/stars/enums'
import { UserStarMetaData } from './user-star-metadata.interface'

export interface ContributionStarsEventPayload {
  userId: string
  action: StarActionType
  metadata: UserStarMetaData
}
