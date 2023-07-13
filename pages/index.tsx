import { useProfileFollowing } from '@lens-protocol/react-web';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi'
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Feed from '@/components/Feed'
import classNames from 'classnames';
import { isAddress } from 'ethers/lib/utils.js';
import { useRouter } from 'next/router';
import { formatAddress } from '@/utils';
import { X } from 'lucide-react';
import Link from 'next/link';
import Profile from '@/components/ui/profile'

const exampleProfiles = ['stani.lens', 'demiurgeboy.lens', 'zer8_future.lens', 'paris.lens', 'owocki.lens', 'timcopeland.lens']

export default function Home() {
  const router = useRouter()
  const [loggedInAddress, setLoggedInAddress] = useState<string>()
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal();
  const asUser = router.query?.as as string

  const handleActivateBurnerUser = (user: string, handle?: string) => {
    const url = {
      pathname: router.pathname,
      query: { as: user, handle: handle }
    }
    router.push(url)
  }

  // hydration hack
  useEffect(() => {
    setLoggedInAddress(address)
  }, [address])

  return (
    <>
      <Head>
        <title>Funding.social - Social feed for grant donors & friends</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌿</text></svg>"
        />
      </Head>
      <section className={classNames("fixed w-full h-full top-0 left-0 bg-cover bg-center bg-opacity-10 z-10", {
        "bg-not-connected": !loggedInAddress,
        "bg-connected": loggedInAddress
      })} />
      <section className='container relative mx-auto z-20'>
        <nav className='flex flex-1 justify-between items-center p-2'>
          <div>
            <Link href="/">
              <img src="/logo.svg" className='w-full' />
            </Link>
          </div>
          <ConnectButton chainStatus="none" />
        </nav>
        <main className='p-2 mt-10 min-h-[90dvh] flex flex-1 flex-col justify-between'>
          {(loggedInAddress || isAddress(asUser)) ? <Intro address={loggedInAddress as string} /> : <>
            <div className='w-full text-center mt-32 text-txt grid gap-12'>
              <h1 className="font-semibold font-grad text-5xl grid gap-3">
                <span>See what people</span>
                <span className="text-handle">on your lens social graph</span>
                <span>are funding on Gitcoin</span>
              </h1>
              <h2 className="text-2xl font-inter">Please <span className="text-handle" role="button" onClick={openConnectModal}>connect wallet</span> to continue to your feed</h2>
            </div>

            <section className='items-center container mx-auto'>
              <div className='my-12 text-xl font-bold w-full text-center font-grad'>OR</div>

              <div className='w-full mb-3 text-center font-inter'>
                Explore feed as a grants donor user
              </div>
              <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-inter'>
                {exampleProfiles.map((id) => <Profile key={id} user={id} activateBurnerUser={handleActivateBurnerUser} />)}
              </div>
            </section>
          </>}
          <div className='w-full text-center mt-8'>
            <span>Made with ❤️ by <Link href="https://supermodular.xyz" target="_blank" className='underline underline-offset-2'>Supermodular</Link>, built on top of <Link href="https://docs.allo.gitcoin.co/getting-started/introduction" target="_blank" className='underline underline-offset-2'>Allo Protocol</Link></span>
          </div>
        </main>
      </section>
    </>
  )
}

function Intro({ address }: { address: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const asUser = router.query?.as as string
  const handle = router.query?.handle as string


  const { data, hasMore, loading: followingLoading, next } = useProfileFollowing({
    walletAddress: (isAddress(asUser) ? asUser : address || "") as string,
    // walletAddress: "0x00De4B13153673BCAE2616b67bf822500d325Fc3",
    // walletAddress: "0xA83444576F86C8B59A542eC2F286a19aB12c2666",
    limit: 50
  })

  const handleActivateBurnerUser = (user: string) => {
    const url = {
      pathname: router.pathname,
      query: { ...router.query, as: user }
    }
    setLoading(true)
    router.push(url)
  }

  const resetActiveBurnerUser = () => {
    setLoading(true)
    router.push({ pathname: router.pathname })
  }

  useEffect(() => {
    if (!followingLoading) {
      if (hasMore) {
        next()
      } else {
        setLoading(false)
      }
    }
  }, [data, followingLoading])

  return (
    <>
      <section className='mt-3 flex flex-col flex-1'>
        {/* {asUser && <div className='flex items-center absolute top-3 p-2 px-4 font-inter text-sm bg-slate-50 rounded-full left-[42%]'>
          <span>Exploring feed as {formatAddress(asUser)}</span>
          <span className='ml-3 w-6 h-6 p-1 inline-flex items-center justify-center rounded-full hover:bg-slate-600 hover:text-white' role="button" onClick={resetActiveBurnerUser}><X className='w-4 h-4' /></span>
        </div>} */}
        {loading ? <div className='flex flex-1 items-center justify-center'>
          <span>Loading Lens Following <span className='italic'>({data?.length || 0} friends loaded)</span>...</span>
        </div> : <Feed following={data} handle={handle} activateBurnerUser={handleActivateBurnerUser} />}
      </section>
    </>
  );
}
