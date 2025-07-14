import { S3 } from 'aws-sdk'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { RemoveFileDto } from '@app/src/images/dto'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { ErrorKey, UploadDestination } from '@app/src/shared/enums'

async function removeS3(config, params): Promise<any> {
  const s3Client = new S3(config)

  return new Promise((resolve, reject) => {
    s3Client.deleteObject(params, (err, data) => {
      if (err) {
        reject(err.message)
      }

      resolve(data)
    })
  })
}

export default async function (payload: RemoveFileDto): Promise<SuccessRO> {
  try {
    const image: ImagesEntity = await this.documentExists({
      condition: [
        {
          where: {
            id: payload.id,
            filename: payload.filename,
            section: payload.type,
          },
        },
      ],
      message: ErrorKey.IMAGE_NOT_FOUND,
    })

    await removeS3(
      {
        accessKeyId: this.configService.get('app.awsAccessKeyId'),
        secretAccessKey: this.configService.get('app.awsSecretAccessKey'),
      },
      {
        Bucket: this.configService.get('app.awsS3Bucket'),
        Key: `${UploadDestination[payload.type]}/${payload.filename}`,
      },
    )

    await this.imagesRepository.remove(image)

    this.logger.debug(`File [${payload.filename}] successfully delete`)

    return {
      success: true,
      message: `File [${payload.filename}] successfully delete`,
    }
  } catch (e) {
    throw new BadRequestException(e.message)
  }
}
