import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import axios from 'axios'
import { orderBy } from 'lodash'
import { kv } from '@vercel/kv'

type NextApiRequestWithFollowings = NextApiRequest & {
  body: {
    chainId: number
    followings: string[]
  }
}

type Contribution = {
  blockNumber: number
  timestamp: number
  chainId?: string
}

type ResponseData = {
  contributions: Contribution[]
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}

const mainnetClient = new ethers.providers.JsonRpcProvider(process.env.MAINNET_ALCHEMY as string)

const opClient = new ethers.providers.JsonRpcProvider(process.env.OP_ALCHEMY as string)

const addressToPath = (address: string) => {
  return (address.match(/.{1,6}/g) || []).join('/')
}

const loadContributions = async ({ chainId, addressPath }: { chainId: string; addressPath: string }) => {
  try {
    const req = await axios(`https://indexer-grants-stack.gitcoin.co/data/${chainId}/contributors/${addressPath}.json`)
    const contributions = req.data as Contribution[]

    const res = await Promise.all(
      contributions.map(async (i) => {
        try {
          // load block data
          const client = chainId === '1' ? mainnetClient : opClient

          await client.ready

          // lookup on kv store
          const kvKey = `${chainId}-${i.blockNumber}`
          let timestamp = (await kv.get(kvKey)) as number

          // if not found, query and store in kv store
          if (!timestamp) {
            const block = await client.getBlock(i.blockNumber)
            timestamp = block.timestamp
            await kv.set(kvKey, timestamp)
          }

          i.timestamp = timestamp
          i.chainId = chainId
        } catch (error) {
          console.log('Error occurred', error)
        }

        return i
      })
    )

    return res
  } catch (error) {
    return []
  }
}

export default async function handler(req: NextApiRequestWithFollowings, res: NextApiResponse<ResponseData>) {
  if (req.method === 'POST') {
    const { followings, chainId = 1 } = req.body

    const realAddresses = followings
      .filter((i: string) => ethers.utils.isAddress(i))
      .map((i: string) => addressToPath(ethers.utils.getAddress(i)))

    const contributions = (
      await Promise.all(
        realAddresses.map(async (addressPath: string) => {
          const mainnetContributions = await loadContributions({ chainId: '1', addressPath })
          const opContributions = await loadContributions({ chainId: '10', addressPath })

          return [...mainnetContributions, ...opContributions]
        })
      )
    ).reduce<any[]>((acc, curr: any[]) => {
      return [...acc, ...curr]
    }, [])

    res.status(200).json({ contributions: orderBy(contributions, ['timestamp'], ['desc']) })
  }
}
