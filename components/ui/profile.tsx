import { useProfile } from '@lens-protocol/react-web'
import { Button } from './button'
import { formatImageURL } from "@/utils"
import classNames from 'classnames'

type ProfilePicture = {
  original: {
    url: string
  }
}

const Profile = ({ user, activateBurnerUser }: { user: string, activateBurnerUser?: (address: string, handle: string) => void }) => {
  const { data: userProfile } = useProfile({ handle: user })
  const standAlone = !activateBurnerUser

  // return (<div className="max-w-sm bg-slate-300 rounded p-2">
  return (<div className={classNames("rounded font-inter", {
    "bg-brand shadow-[0_4px_8px_0_rgba(118,52,31,0.35)] p-3": !standAlone
  })}>
    <div className='flex flex-1 flex-col w-full'>
      <div className={classNames('h-[90px] overflow-hidden rounded', {
        "h-[120px]": standAlone
      })}>
        <img src={formatImageURL((userProfile?.coverPicture as ProfilePicture)?.original?.url || '/img/placeholder.jpg')} onError={(e) => {
          e.currentTarget.src = '/img/placeholder.jpg'
        }} className="w-full h-auto" />
      </div>
      <div className={classNames('flex flex-1 flex-col space-y-5 p-6 pt-0 -mt-10', {
        "pb-0": standAlone
      })}>
        <img src={formatImageURL((userProfile?.picture as ProfilePicture)?.original?.url || "")} className="w-20 h-20 rounded-full" />
        <div>
          <h2 className={classNames('text-2xl font-semibold', {
            "min-h-[32px]": !standAlone
          })}>{userProfile?.name}</h2>
          <h3 className='text-slate-400 text-sm underline underline-offset-2'>{userProfile?.handle}</h3>
        </div>
        <p className={classNames('w-full text-base text-slate-400 line-clamp-3', {
          "min-h-[72px]": !standAlone
        })}>{userProfile?.bio}</p>

        {!standAlone && <div className='flex flex-1 flex-row justify-end items-center'>
          <div>
            <Button className='bg-btn hover:bg-hover text-txt' onClick={() => activateBurnerUser(userProfile?.ownedBy as string, user)}>
              View as user
            </Button>
          </div>
        </div>}
      </div>

      {standAlone && userProfile?.name && <div className='flex flex-1 mt-8 mb-4'>
        <span>People <span className='capitalize'>{userProfile.name}</span> Is Following Are Funding These Grants</span>
      </div>}
    </div>
  </div>)
}

export default Profile