import { Test, TestingModule } from '@nestjs/testing'
import { UserDonationsService } from '@app/src/donations/user-donations.service'

describe('Blockchain Service', () => {
  let userDonationsService: UserDonationsService
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [],
      providers: [UserDonationsService],
    }).compile()

    userDonationsService = module.get<UserDonationsService>(UserDonationsService)
    jest.setTimeout(100000)
  })

  describe('Should work', () => {
    it('Gets Rank', async () => {
      const output = await userDonationsService.initiateDirectDonation('12', {
        amount: '5',
        currency: 'USDC',
        donation_project: 'b7f4e626-b651-41ff-b263-59ad9a867a7d',
        payment_method: 'fbeee3ce-d9cd-48b6-aa81-9b3b0faeda5a',
      })
      expect(output).not.toBeNull()
    })
  })
})
