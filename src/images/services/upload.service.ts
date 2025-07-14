import { S3 } from 'aws-sdk'
import slugify from 'slugify'
import * as sharp from 'sharp'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ErrorKey, UploadDestination } from '@app/src/shared/enums'

async function uploadS3(config, params): Promise<{ Location: string }> {
  const s3Client = new S3(config)

  return new Promise((resolve, reject) => {
    s3Client.upload(params, (err, data) => {
      if (err) {
        reject(err.message)
      }

      resolve(data)
    })
  })
}

export default async function (
  file: Express.Multer.File,
  type: string,
  is_featured: boolean,
): Promise<SuccessRO> {
  try {
    const fileName = `${new Date().getTime()}-${slugify(file.originalname, {
      lower: true,
      strict: true,
      locale: 'en',
      remove: undefined,
      replacement: '.',
    })}`

    let uploadParams
    const fileMimeType = file.mimetype
    let optimizedBuffer = file.buffer

    if (fileMimeType.startsWith('image/')) {
      let maxDimension = 1024

      if (type === 'BANNER') {
        maxDimension = 1600
      }

      const metadata = await sharp(file.buffer).metadata()
      const { width, height } = metadata

      const resizeOptions = width > height ? { width: maxDimension } : { height: maxDimension }

      const sharpInstance = sharp(file.buffer).resize(resizeOptions)

      if (fileMimeType === 'image/webp') {
        optimizedBuffer = await sharpInstance.webp({ quality: 90 }).toBuffer()
      } else {
        optimizedBuffer = await sharpInstance.jpeg({ quality: 90 }).toBuffer()
      }

      uploadParams = {
        Bucket: this.configService.get('app.awsS3Bucket'),
        Key: `${UploadDestination[type]}/${fileName}`,
        Body: optimizedBuffer,
        ContentType: fileMimeType,
        CacheControl: 'public, max-age=2592000',
      }
    } else {
      throw new BadRequestException(ErrorKey.UNSUPPORTED_FILE_TYPE)
    }

    // Perform upload
    const uploadedFile = await uploadS3(
      {
        accessKeyId: this.configService.get('app.awsAccessKeyId'),
        secretAccessKey: this.configService.get('app.awsSecretAccessKey'),
      },
      uploadParams,
    )

    // Prepare response data for saving in the database
    const fileResponse = {
      url: uploadedFile.Location,
      filename: fileName,
      is_featured,
      section: type,
    }

    // Save file info to the database
    const fileRecord = await this.imagesRepository.create(fileResponse)
    await this.imagesRepository.save(fileRecord)

    return {
      success: true,
      message: `File [${file.originalname}] successfully uploaded`,
      data: fileRecord,
    }
  } catch (e) {
    return HandleErrors(e)
  }
}
