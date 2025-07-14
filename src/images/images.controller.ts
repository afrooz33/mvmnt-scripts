import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { BadRequestResponse, GetResponse } from '@app/src/shared/swagger/responses'
import { FileInterceptor } from '@nestjs/platform-express'
import { ValidationPipe } from '@app/src/shared/validations'
import { SuccessRO } from '@app/src/shared/dto'
import { RemoveFileDto, UploadDto, MarkFeaturedDto } from './dto'
import { ImagesService } from './images.service'

@ApiTags('Upload')
@Controller('upload')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'File upload' })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() { type, is_featured }: UploadDto,
  ): Promise<SuccessRO> {
    return this.imagesService.upload(file, type, is_featured)
  }

  @Delete()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Remove file' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('File does not exist'))
  async remove(@Body() payload: RemoveFileDto): Promise<SuccessRO> {
    return this.imagesService.remove(payload)
  }

  @Patch('mark-featured')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Mark file as featured' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('File does not exist'))
  async markFeatured(@Body() payload: MarkFeaturedDto): Promise<SuccessRO> {
    return this.imagesService.markFeatured(payload)
  }
}
