import { SetMetadata } from '@nestjs/common'

import { UserTypes } from '@app/shared/enums'

export const USER_TYPE_KEY = 'user_type'

export const UserType = (...userTypes: UserTypes[]) => SetMetadata(USER_TYPE_KEY, userTypes)
