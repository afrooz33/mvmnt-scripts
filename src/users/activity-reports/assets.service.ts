import * as fs from 'fs'
import * as path from 'path'
import { S3 } from 'aws-sdk'
import * as sharp from 'sharp'
import * as ffmpeg from 'fluent-ffmpeg'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, BadRequestException } from '@nestjs/common'
import { UploadDestination } from '@app/src/shared/enums'
import { ActivityReportAssetsEntity } from './entities/activity-report-assets.entity'

@Injectable()
export class AssetsService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(ActivityReportAssetsEntity)
    private assetsRepository: Repository<ActivityReportAssetsEntity>,
  ) {}

  private async uploadS3(params): Promise<{ Location: string }> {
    const s3 = new S3({
      accessKeyId: this.configService.get('app.awsAccessKeyId'),
      secretAccessKey: this.configService.get('app.awsSecretAccessKey'),
      region: this.configService.get('app.awsS3Region'),
    })

    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) return reject(err.message)
        resolve(data)
      })
    })
  }

  // Main media processing and upload function
  async processAndUpload(file: Express.Multer.File, is_featured: boolean) {
    const fileName = `${Date.now()}-${file.originalname}`
    const fileMimeType = file.mimetype
    const tempDirPath = path.join(__dirname, '../../temp')
    const tempFilePath = path.join(tempDirPath, fileName)
    let uploadParams
    let optimizedBuffer = file.buffer

    try {
      // Ensure the temp directory exists
      if (!fs.existsSync(tempDirPath)) {
        fs.mkdirSync(tempDirPath, { recursive: true })
      }

      // Write the file to the temp folder to process
      fs.writeFileSync(tempFilePath, file.buffer)

      // Process image or video based on the mime type
      if (fileMimeType.startsWith('image/')) {
        const targetAspectRatio = await this.getAdjustedAspectRatio(tempFilePath, fileMimeType)
        optimizedBuffer = await this.processImage(tempFilePath, targetAspectRatio)
        uploadParams = {
          Bucket: this.configService.get('app.awsS3Bucket'),
          Key: `${UploadDestination.ACTIVITY_REPORT}/${fileName}`,
          Body: optimizedBuffer,
          ContentType: fileMimeType,
          CacheControl: 'public, max-age=2592000',
        }
      } else if (fileMimeType.startsWith('video/')) {
        const targetAspectRatio = await this.getAdjustedAspectRatio(tempFilePath, fileMimeType)
        const processedVideoPath: any = await this.processVideo(tempFilePath, targetAspectRatio)

        uploadParams = {
          Bucket: this.configService.get('app.awsS3Bucket'),
          Key: `${UploadDestination.ACTIVITY_REPORT}/${fileName}`,
          Body: fs.createReadStream(processedVideoPath),
          ContentType: fileMimeType,
          CacheControl: 'public, max-age=2592000',
        }
      } else {
        throw new BadRequestException('Unsupported media type')
      }

      // Upload to S3
      const uploadedFile = await this.uploadS3(uploadParams)

      // Create a record in the database
      const fileRecord = this.assetsRepository.create({
        filename: fileName,
        url: uploadedFile.Location,
        mime_type: fileMimeType,
        is_featured,
      })

      await this.assetsRepository.save(fileRecord)
      return fileRecord
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath)
      }
    }
  }

  // Helper function to calculate adjusted aspect ratio
  private async getAdjustedAspectRatio(filePath: string, mimeType: string) {
    const aspectRatio: any = await this.getAspectRatio(filePath, mimeType)
    return this.getClosestAllowedAspectRatio(aspectRatio)
  }

  // Get aspect ratio of media (image/video)
  private async getAspectRatio(filePath: string, mimeType: string) {
    if (mimeType.startsWith('image/')) {
      const metadata = await sharp(filePath).metadata()
      return metadata.width / metadata.height
    } else if (mimeType.startsWith('video/')) {
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
          if (err) return reject(err)
          const videoStream = metadata.streams.find((stream) => stream.width && stream.height)
          if (!videoStream) return reject(new Error('No video stream found'))
          resolve(videoStream.width / videoStream.height)
        })
      })
    } else {
      throw new BadRequestException('Unsupported media type')
    }
  }

  // Get closest allowed aspect ratio
  private getClosestAllowedAspectRatio(aspectRatio: number) {
    const allowedRatios = [
      { ratio: 1 / 1, width: 1080, height: 1080 }, // Square
      { ratio: 4 / 5, width: 1080, height: 1350 }, // Portrait
      { ratio: 9 / 16, width: 1080, height: 1920 }, // Full-Screen Portrait
      { ratio: 1.91 / 1, width: 1080, height: 566 }, // Landscape
    ]

    let closest = allowedRatios[0]
    let minDiff = Math.abs(aspectRatio - allowedRatios[0].ratio)

    for (let i = 1; i < allowedRatios.length; i++) {
      const diff = Math.abs(aspectRatio - allowedRatios[i].ratio)
      if (diff < minDiff) {
        closest = allowedRatios[i]
        minDiff = diff
      }
    }

    return closest
  }

  // Process image
  private async processImage(
    filePath: string,
    targetAspectRatioObj: { ratio: number; width: number; height: number },
  ) {
    const outputBuffer = await sharp(filePath)
      .resize(targetAspectRatioObj.width, targetAspectRatioObj.height)
      .toBuffer()
    return outputBuffer
  }

  // Process video
  private async processVideo(
    filePath: string,
    targetAspectRatioObj: { ratio: number; width: number; height: number },
  ) {
    const outputPath = `${filePath}_processed.mp4`
    return new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .videoFilters(
          `crop='if(gt(a,${targetAspectRatioObj.ratio}),ih*${targetAspectRatioObj.ratio},iw)':'if(lt(a,${targetAspectRatioObj.ratio}),iw/${targetAspectRatioObj.ratio},ih)'`,
        )
        .size(`${targetAspectRatioObj.width}x${targetAspectRatioObj.height}`)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .save(outputPath)
    })
  }
}
