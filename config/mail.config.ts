export default () => ({
  mail: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 25,
    secure: process.env.MAIL_SECURE_CONNECTION ? true : false,
    auth: {
      user: process.env.MAIL_USERNAME,
      password: process.env.MAIL_PASSWORD,
    },
    subject: {
      forgotPassword: {
        name: '[MVMNT]Forgot Password',
        template: './forgot-password',
      },
      emailVerification: {
        name: '[MVMNT]Email Verification',
        template: './email-verification',
      },
      nonprofitUserAccountVerification: {
        name: "[MVMNT]Nonprofit's user dashboard account verification",
        template: './nonprofit-user-account-verification',
      },
      changeEmail: {
        name: '[MVMNT]Change email OTP',
        template: './change-email',
      },
      donationProjectToBeCancel: {
        name: '[MVMNT]Donation project to be cancel',
        template: './donation-project-to-be-cancel',
      },
      auctionDeleted: {
        name: '[MVMNT]Auction deleted',
        template: './auction-deleted',
      },
      dealUpdateNotes: {
        name: '[MVMNT]Deal update notes',
        template: './deal-update-notes',
      },
      fundraiserPageSuspended: {
        name: '[MVMNT]Fundraiser page suspended',
        template: './fundraiser-page-suspended',
      },
      fundraiserFormStatusUpdate: {
        name: '[MVMNT]Fundraiser form staus update',
        template: './fundraiser-form-status-updated',
      },
      fundraiserPageReactivated: {
        name: '[MVMNT]Fundraiser page reactivated',
        template: './fundraiser-page-reactivated',
      },
      re2UserAccountStatusUpdated: {
        name: '[MVMNT]RE2 user account status updated',
        template: './re2-user-account-status-updated',
      },
      donationReceipt: {
        name: '[MVMNT]Donation receipt',
        template: './donation-receipt',
      },
      contactSellerNotification: {
        name: '[MVMNT]Contact Seller Notification',
        template: 'contact-seller-notification',
      },
    },
  },
})
