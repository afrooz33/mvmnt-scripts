import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Put,
  Query,
  Patch,
} from '@nestjs/common'
import {
  UnauthorizedResponse,
  BadRequestResponse,
  ForbiddenResponse,
  GetResponse,
} from '@app/src/shared/swagger/responses'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger'
import { NewsService } from '@app/src/nonprofit/news/news.service'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { Status, UserTypes } from '@app/src/shared/enums'
import { FilterDeleted } from '@app/src/shared/decorators'
import { CreateNewsDto, QueryDto, UpdateNewsDto } from './dto'
import { NewsEntity } from './entities/news.entity'

@ApiTags('Nonprofit News')
@Controller('nonprofit/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'News Get/Filter All News' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
    @User('id') userId: string,
  ): Promise<PaginateRO> {
    return this.newsService.show(query, userId)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get news' })
  @ApiOkResponse({ type: NewsEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<NewsEntity> {
    return this.newsService.showOne(id, query, userId)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create Nonprofit News' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('News does not exist'))
  create(@Body() createNewsDto: CreateNewsDto, @User('id') userId: string): Promise<SuccessRO> {
    return this.newsService.create(createNewsDto, userId)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update News' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('News does not exist'))
  update(
    @Body() payload: UpdateNewsDto,
    @User('id') userId: string,
    @Param('id') id: string,
  ): Promise<NewsEntity> {
    return this.newsService.updateNews(id, payload, userId)
  }

  @Patch('update-status/:id/draft')
  @ApiOperation({ summary: 'Update news status as draft' })
  @ApiOkResponse({ type: NewsEntity })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('News does not exist'))
  async updateStatus(@Param('id') id: string, @User('id') userId: string): Promise<NewsEntity> {
    return this.newsService.updateUnpublished(id, userId)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update news view count' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('News does not exist'))
  view(@Param('id') id: string): Promise<NewsEntity> {
    return this.newsService.updateOne(
      {
        id,
        views: () => 'views + 1',
      },
      {
        where: {
          id,
        },
      },
    )
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Delete news' })
  @ApiOkResponse({ type: NewsEntity })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async delete(@Param('id') news: string, @User('id') id: string): Promise<NewsEntity> {
    return this.newsService.updateUnpublished(news, id, Status.DELETED)
  }
}
