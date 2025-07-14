import axios from 'axios'
import { createReadStream } from 'fs'
import { FormData } from 'formdata-node'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function (file: Express.Multer.File): Promise<SuccessRO> {
  try {
    const data = new FormData()

    data.append('file', createReadStream(file.path))

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://${process.env.ZENDESK_DOMAIN}.zendesk.com/api/v2/uploads?filename=${file.filename}`,
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.ZENDESK_EMAIL}/token:${process.env.ZENDESK_API_TOKEN}`,
        ).toString('base64')}`,
      },
      data: data,
    }

    const upload = await axios.request(config)

    return {
      success: true,
      message: `File [${file.filename}] successfully upload`,
      data: upload.data.upload.token,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
