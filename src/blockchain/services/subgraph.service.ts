import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client/core'
import fetch from 'cross-fetch'

@Injectable()
export class SubgraphService {
  private client: ApolloClient<any>
  private subgraphUrl: string

  constructor(private readonly configService: ConfigService) {
    this.subgraphUrl = this.configService.getOrThrow('blockchain.subgraphUrl')

    this.client = new ApolloClient({
      link: new HttpLink({ uri: this.subgraphUrl, fetch }),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: 'no-cache',
        },
      },
    })
  }

  async getTokenData(tokenAddress: string) {
    const query = gql`
      query GetTokenData($tokenAddress: String!) {
        token(id: $tokenAddress) {
          id
          name
          symbol
          totalSupply
          holders {
            id
            balance
          }
          transferCount
          transactions {
            id
            timestamp
            from {
              id
            }
            to {
              id
            }
            amount
          }
        }
      }
    `

    const variables = {
      tokenAddress: tokenAddress.toLowerCase(),
    }

    const { data } = await this.client.query({ query, variables })
    return data
  }

  async getTokenHolders(tokenAddress: string) {
    const query = gql`
      query GetTokenHolders($tokenAddress: String!) {
        token(id: $tokenAddress) {
          holders(first: 1000, orderBy: balance, orderDirection: desc) {
            id
            balance
            lastUpdated
          }
        }
      }
    `

    const variables = {
      tokenAddress: tokenAddress.toLowerCase(),
    }

    const { data } = await this.client.query({ query, variables })
    return data
  }

  async getTokenTransfers(tokenAddress: string, limit: number = 100) {
    const query = gql`
      query GetTokenTransfers($tokenAddress: String!, $limit: Int!) {
        transfers(
          first: $limit
          where: { token: $tokenAddress }
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
          from {
            id
          }
          to {
            id
          }
          amount
          timestamp
          transaction {
            id
          }
        }
      }
    `

    const variables = {
      tokenAddress: tokenAddress.toLowerCase(),
      limit,
    }

    const { data } = await this.client.query({ query, variables })
    return data
  }

  async getTokenStats(tokenAddress: string) {
    const query = gql`
      query GetTokenStats($tokenAddress: String!) {
        token(id: $tokenAddress) {
          id
          totalSupply
          transferCount
          holderCount
          dailyVolumes(first: 30, orderBy: timestamp, orderDirection: desc) {
            volume
            timestamp
          }
          priceHistory(first: 30, orderBy: timestamp, orderDirection: desc) {
            price
            timestamp
          }
        }
      }
    `

    const variables = {
      tokenAddress: tokenAddress.toLowerCase(),
    }

    const { data } = await this.client.query({ query, variables })
    return data
  }

  async getICODetails(brandId: string) {
    const query = gql`
      query GetICODetails($brandId: String!) {
        ico(id: $brandId) {
          id
          brandId
          startTime
          endTime
          minContribution
          maxContribution
          tokenAmount
          tokenPrice
          totalTokensSold
          isInitialICO
          status
          totalContributed
          totalParticipants
          softCap
          hardCap
          vestingSchedule {
            cliffPeriod
            vestingPeriod
            tgePercentage
          }
          contributions {
            user {
              id
            }
            amount
            claimed
            timestamp
          }
        }
      }
    `

    const variables = { brandId }
    const { data } = await this.client.query({ query, variables })
    return data
  }

  async getICOContributions(brandId: string) {
    const query = gql`
      query GetICOContributions($brandId: String!) {
        contributions(where: { ico: $brandId }, orderBy: timestamp, orderDirection: desc) {
          id
          user {
            id
          }
          amount
          claimed
          timestamp
          transaction {
            id
          }
        }
      }
    `

    const variables = { brandId }
    const { data } = await this.client.query({ query, variables })
    return data
  }

  async getICOWhitelistEvents(brandId: string) {
    const query = gql`
      query GetICOWhitelistEvents($brandId: String!) {
        whitelistEvents(where: { ico: $brandId }, orderBy: timestamp, orderDirection: desc) {
          id
          user {
            id
          }
          isWhitelisted
          whitelistedAt
          transaction {
            id
          }
        }
      }
    `

    const variables = { brandId }
    const { data } = await this.client.query({ query, variables })
    return data
  }

  async getICOStatusChanges(brandId: string) {
    const query = gql`
      query GetICOStatusChanges($brandId: String!) {
        icoStatusChanges(where: { ico: $brandId }, orderBy: timestamp, orderDirection: desc) {
          id
          oldStatus
          newStatus
          timestamp
          transaction {
            id
          }
        }
      }
    `

    const variables = { brandId }
    const { data } = await this.client.query({ query, variables })
    return data
  }

  async getTokenDistributions(brandId: string) {
    const query = gql`
      query GetTokenDistributions($brandId: String!) {
        tokenDistributions(where: { ico: $brandId }, orderBy: timestamp, orderDirection: desc) {
          id
          recipient {
            id
          }
          amount
          timestamp
          transaction {
            id
          }
        }
      }
    `

    const variables = { brandId }
    const { data } = await this.client.query({ query, variables })
    return data
  }

  async getUserICOParticipation(userAddress: string) {
    const query = gql`
      query GetUserICOParticipation($userAddress: String!) {
        user(id: $userAddress) {
          id
          contributions {
            ico {
              id
              brandId
              status
            }
            amount
            claimed
            timestamp
          }
          whitelistStatuses {
            ico {
              id
              brandId
              status
            }
            isWhitelisted
            whitelistedAt
          }
          tokenDistributions {
            ico {
              id
              brandId
            }
            amount
            timestamp
          }
        }
      }
    `

    const variables = { userAddress: userAddress.toLowerCase() }
    const { data } = await this.client.query({ query, variables })
    return data
  }

  async getActiveICOs() {
    const query = gql`
      query GetActiveICOs {
        icos(where: { status: "ACTIVE" }, orderBy: startTime, orderDirection: asc) {
          id
          brandId
          startTime
          endTime
          minContribution
          maxContribution
          tokenAmount
          isInitialICO
          totalContributed
          totalParticipants
        }
      }
    `

    const { data } = await this.client.query({ query })
    return data
  }

  async getICOPhases(brandId: string) {
    const query = gql`
      query GetICOPhases($brandId: String!) {
        icoPhases(where: { ico: $brandId }, orderBy: startTime) {
          id
          name
          startTime
          endTime
          tokenPrice
          minContribution
          maxContribution
          hardCap
          softCap
          status
          totalContributed
          totalParticipants
        }
      }
    `

    const variables = { brandId }
    const { data } = await this.client.query({ query, variables })
    return data
  }

  async getUserContributionLimits(brandId: string, userAddress: string) {
    const query = gql`
      query GetUserContributionLimits($brandId: String!, $userAddress: String!) {
        ico(id: $brandId) {
          id
          currentPhase {
            id
            minContribution
            maxContribution
          }
          userContributions: contributions(where: { user: $userAddress }) {
            amount
          }
        }
      }
    `

    const variables = {
      brandId,
      userAddress: userAddress.toLowerCase(),
    }
    const { data } = await this.client.query({ query, variables })
    return data
  }
}
