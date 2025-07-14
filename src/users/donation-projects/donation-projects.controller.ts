import { ForbiddenResponse, BadRequestResponse } from '@app/src/shared/swagger/responses'
import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger'
import { PaginateRO } from '@app/src/shared/dto'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { DonationProjectsService } from './donation-projects.service'
import { QueryDto } from './dto'

@ApiTags('Donation Projects Public APi')
@Controller('donation-projects')
export class DonationProjectsController {
  constructor(private readonly donationProjectsService: DonationProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all donation projects' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(null, new ValidationPipe())
    query: QueryDto,
  ): Promise<PaginateRO> {
    return this.donationProjectsService.show(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get donation Project by id' })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(@Param('id') id: string): Promise<DonationProjectEntity> {
    return this.donationProjectsService.showOne(id)
  }
}
