/* tslint:disable */
import { ReactNode, useEffect, useState } from 'react'
import { Following } from '@lens-protocol/react-web'
import axios from 'axios'
import TokenAmount from './TokenAmount'
import classNames from 'classnames'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useEnsAddress } from 'wagmi'
import { isAddress } from 'ethers/lib/utils.js'
import { formatDistance } from 'date-fns'
import { format } from 'date-fns-tz'
import Profile from './ui/profile'

type ProfilePicture = {
  original: {
    url: string
  }
}

type Contribution = {
  id: string
  voter: string
  token: string
  amount: string
  roundId: string
  chainId: string
  roundName: string
  amountUSD: number
  timestamp: number
  blockNumber: number
  projectTitle: string
  applicationId: string
}

const DonorCard = ({ image, timestamp, handle, type, children }: { image: string, timestamp: number, handle: string, type: 'col' | 'row', children: ReactNode }) => {
  if (type === 'row') {
    return (<div className='w-full p-6 flex flex-row items-center space-x-4 h-full font-inter bg-brand shadow-[0_4px_8px_0_rgba(118,52,31,0.35) rounded-md card-shadow'>
      <img src={image} className="w-12 h-12 rounded-full inline-flex" />
      <div className="text-base">
        <span className="font-semibold">{handle}</span>{' '}{children}
      </div>
    </div>)
  } else {
    return <div>
      <div className='w-full p-6 flex flex-col items-center space-x-4 space-y-5 h-full font-inter bg-brand shadow-[0_4px_8px_0_rgba(118,52,31,0.35) rounded-md card-shadow'>
        <div className='flex flex-row w-full space-x-4'>
          <img src={image} className="w-12 h-12 rounded-full inline-flex" />
          <div className='flex flex-col'>
            <span className="font-semibold text-handle">{handle}</span>
            <span className='text-sm'>
              {formatDistance(timestamp * 1000, new Date(), { addSuffix: true })} ({format(timestamp * 1000, "yyyy/MM/dd HH:MM", { timeZone: "UTC" })} UTC)
            </span>
          </div>
        </div>
        <div className='w-full'>
          {children}
        </div>
      </div>
    </div>
  }
}

const Feed = ({ following, handle, activateBurnerUser }: { following?: Following[], handle?: string, activateBurnerUser: (address: string) => void }) => {
  const [loading, setLoading] = useState(true)
  const [followingMap, setFollowingMap] = useState<Record<string, Following>>({})
  const [burnerUser, setBurnerUser] = useState("")
  const [contributions, setContributions] = useState<Contribution[]>([])

  const { data: _burnerUserAddress, isLoading: resolvingName } = useEnsAddress({
    name: burnerUser,
    enabled: !isAddress(burnerUser) && burnerUser.includes('.')
  })

  const burnerUserAddress = isAddress(burnerUser) ? burnerUser : _burnerUserAddress

  useEffect(() => {
    async function loadFeed(data: string[]) {
      try {
        const res = await axios.post(`/api/feed`, {
          followings: data
        })

        setContributions(res.data.contributions)
      } catch (error) {
        console.log(`Can't load contributions`)
      }

      setLoading(false)
    }

    if (following) {
      const followingList = new Set<string>([])
      const _followingMap = following.reduce<Record<string, any>>((acc, curr) => {
        acc[curr?.profile.ownedBy] = curr

        followingList.add(curr?.profile.ownedBy.toLowerCase())

        return acc
      }, {})

      setFollowingMap(_followingMap)

      // load feed contributions here
      loadFeed(Array.from(followingList))
    }

    return () => {
      setLoading(true)
      setFollowingMap({})
      setContributions([])
    }

  }, [following])

  if (loading) {
    return <div className='flex flex-1 items-center justify-center'>
      <span>Loading Friends' contributions...</span>
    </div>
  }

  return (<section className={classNames('flex flex-1 flex-col w-full mx-auto mb-8', {
    "items-center container": contributions.length === 0,
    "max-w-5xl": contributions.length > 0
  })}>
    {handle && <Profile user={handle} />}
    {contributions.length === 0 || Object.keys(followingMap).length === 0
      ? <>
        <div className='flex flex-col items-center text-lg mt-3 font-inter'>
          <span>You need better on chain friends that fund public goods.</span>
          <span>Here's some ideas on where to get started</span>
        </div>

        <div className='flex flex-1 flex-col items-center w-full mt-12'>
          <div className='mb-4 font-inter'>Explore grants friends feed as another user</div>
          <div className='flex flex-1 flex-col w-full max-w-sm space-y-3'>
            <Input type="text" placeholder='Enter ethereum address' value={burnerUser} onChange={(v) => setBurnerUser(v.currentTarget.value)} />
            <Button size="lg" className='bg-btn hover:bg-hover text-txt' disabled={!burnerUserAddress || resolvingName} onClick={() => {
              activateBurnerUser(burnerUserAddress as string)
              setBurnerUser("")
            }}>{resolvingName ? "Resolving ENS..." : "Track Wallet"}</Button>
          </div>
        </div>
        {contributions.map((contribution) => <DonorCard key={`${contribution.id}-${contribution.applicationId}`} image={(followingMap[contribution.voter]?.profile.picture as ProfilePicture)?.original?.url || ""} timestamp={contribution.timestamp} type="row" handle={followingMap[contribution.voter]?.profile.handle}>
          <>
            donated{' '}<TokenAmount address={contribution.token as `0x${string}`} amount={contribution.amount} chainId={contribution.chainId} /> <span className='italic'>({Number(contribution.amountUSD).toFixed(2)} USD)</span> to <span>
              <a className="font-semibold" href={`https://explorer.gitcoin.co/#/round/${contribution.chainId}/${contribution.roundId.toLowerCase()}/${contribution.roundId.toLowerCase()}-${contribution.applicationId}`} target="_blank" rel="noopener noreferrer">{contribution.projectTitle}</a> on the <a className="font-semibold" href={`https://explorer.gitcoin.co/#/round/${contribution.chainId}/${contribution.roundId.toLowerCase()}`} target="_blank" rel="noopener noreferrer">{contribution.roundName}</a>
            </span>
          </>
        </DonorCard>)}
      </>
      : (<>
        {!handle && <div className='mt-2 font-inter text-lg'>See all the contributions your friends make, all in one place.</div>}
        <div className={classNames('grid grid-cols-1 md:grid-cols-2 grid-flow-row gap-6 my-8', {
          "mt-2": handle
        })}>
          {contributions.map((contribution) => <DonorCard key={`${contribution.id}-${contribution.applicationId}`} image={(followingMap[contribution.voter]?.profile.picture as ProfilePicture)?.original?.url || ""} timestamp={contribution.timestamp} type="col" handle={followingMap[contribution.voter].profile.handle}>
            <>
              Donated{' '}<TokenAmount address={contribution.token as `0x${string}`} amount={contribution.amount} chainId={contribution.chainId} /> <span className='italic'>({Number(contribution.amountUSD).toFixed(2)} USD)</span> to <span>
                <a className="font-semibold" href={`https://explorer.gitcoin.co/#/round/${contribution.chainId}/${contribution.roundId.toLowerCase()}/${contribution.roundId.toLowerCase()}-${contribution.applicationId}`} target="_blank" rel="noopener noreferrer">{contribution.projectTitle}</a> on the <a className="font-semibold" href={`https://explorer.gitcoin.co/#/round/${contribution.chainId}/${contribution.roundId.toLowerCase()}`} target="_blank" rel="noopener noreferrer">{contribution.roundName}</a>
              </span>
            </>
          </DonorCard>)}
        </div>
      </>)
    }
  </section>)
}

export default Feed
