import * as fs from 'fs'
import * as sharp from 'sharp'
import { promisify } from 'util'
import { resolve } from 'path'
import { v4 as uuidv4 } from 'uuid'

const rename = promisify(fs.rename)

import { diskStorage } from 'multer'
import { Logger } from '@nestjs/common'
import { UploadDestination } from '@app/src/shared/enums'

export class UploadHelper {
  static logger = new Logger('UploadHelper')

  static get options() {
    return {
      storage: diskStorage({
        destination: UploadHelper.destination,
        filename: UploadHelper.filename,
      }),
      limits: {
        fileSize: 1024 * 1024 * 8,
      },
    }
  }

  static get zendesk_options() {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const destination: string = resolve(
            process.cwd(),
            'uploads',
            UploadDestination.ZENDESK_ATTACHMENTS,
          )

          return cb(null, destination)
        },
        filename: UploadHelper.filename,
      }),
    }
  }

  static destination(req, file, cb) {
    const destination: string = resolve(process.cwd(), 'uploads', UploadDestination[req.body.type])

    return cb(null, destination)
  }

  static async optimizeImage(file): Promise<void> {
    const path = file.path + 'optimize'

    await sharp(file.path).resize(800).toFile(path)

    await rename(path, file.path)
  }

  static filename(req, file, cb) {
    const filename = `${uuidv4()}_${Date.now()}`

    return cb(null, `${filename}.jpeg`)
  }
}
