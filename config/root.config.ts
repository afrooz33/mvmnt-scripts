/**
 * Root @config file
 * ---------------------
 * @return ConfigModuleOptions
 */

import { ConfigModuleOptions } from '@nestjs/config'

import app from './app.config'
import mail from './mail.config'
import cors from './cors.config'
import auth from './auth.config'
import swagger from './swagger.config'
import blockchain from './blockchain.config'

export default {
  envFilePath: '.env',
  load: [app, cors, auth, mail, swagger, blockchain],
} as ConfigModuleOptions
