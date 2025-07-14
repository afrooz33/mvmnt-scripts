import { Response } from 'express'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { Controller, Get, Res, UsePipes, ValidationPipe } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { DrawerSettingsService } from './drawer-settings.service'

@ApiTags('Shopify widget')
@Controller('shopify/widget')
export class DrawerSettingsController {
  constructor(private readonly drawerSettingService: DrawerSettingsService) {}

  @Get('drawer-settings.css')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 get all drawer settings css' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  async css(@Res() res: Response) {
    const css = await this.drawerSettingService.css()

    res.setHeader('Content-Type', 'text/css')
    res.send(css)
  }

  @Get('drawer-settings.js')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 get all drawer settings js' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  async js(@Res() res: Response) {
    const js = await this.drawerSettingService.js()

    res.setHeader('Content-Type', 'application/javascript')
    res.send(js)
  }
}
