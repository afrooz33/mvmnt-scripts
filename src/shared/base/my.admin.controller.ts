import {
  UnauthorizedResponse,
  BadRequestResponse,
  ForbiddenResponse,
  GetResponse,
} from '@app/src/shared/swagger/responses'
import { Patch, UseGuards, UsePipes, ValidationPipe, Body } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger'
import { JwtAuthGuard, AdminRolesGuard } from '@app/src/shared/auth/guards'
import { SuccessRO, ReorderDto } from '@app/src/shared/dto'
import { UserType } from '@app/src/shared/auth/decorators'
import { UserTypes } from '@app/src/shared/enums'
import { MyEntity } from './my.entity'
import { MyService } from './my.service'

export class MyAdminController<Entity extends MyEntity> {
  constructor(private readonly myService: MyService<Entity>) {}

  @Patch('shuffle-order')
  @ApiBearerAuth()
  @UserType(UserTypes.ADMIN)
  @UseGuards(JwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update resource ordering' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Resource does not exist'))
  reOrder(@Body() payload: ReorderDto) {
    return this.myService.reOrder(payload)
  }
}
