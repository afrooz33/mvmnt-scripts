export default () => ({
  app: {
    name: process.env.APP_NAME || 'MVMNT',
    host: process.env.APP_HOST || 'localhost',
    port: parseInt(process.env.APP_PORT, 10) || 3000,
    debug: !(process.env.NODE_ENV === 'production'),
    prefix: process.env.API_PREFIX || 'api/v1',
    deliveryRadius: process.env.DEFAULT_DELIVERY_LOCATION_RADIUS || 10,
    url: process.env.APP_URL,
    userDashboard: process.env.APP_USER_DASHBOARD_URL || 'http://127.0.0.1:3001',
    nonprofitDashboardUrl: process.env.APP_NONPROFIT_URL || 'http://127.0.0.1:3002',
    re2DashboardUrl: process.env.APP_RE2_URL || 'http://127.0.0.1:3003',
    userDashboardUrl: process.env.APP_USER_URL || 'http://127.0.0.1:3004',
    publicS3BaseUrl:
      process.env.PUBLIC_S3_BASE_URL || 'https://mvmnt-develop.s3.us-east-1.amazonaws.com',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    awsS3Bucket: process.env.AWS_S3_BUCKET || 'mvmnt-develop',
    awsS3Region: process.env.AWS_S3_REGION || 'us-east-1',
    withdrawUnlockDuration: process.env.WITHDRAW_UNLOCK_DURATION,
    resellingSessionSecret: process.env.RESELLING_SESSION_SECRET || '',
    pointAcquisitionDays: process.env.POINT_ACQUISITION_DAYS || 15,
    pointExpirationDays: process.env.POINT_EXPIRATION_DAYS || 150,
    recurring: {
      batchSize: process.env.RECURRING_BATCH_SIZE,
      executionDay: process.env.RECURRING_EXECUTION_DAY,
    },
  },
})
