import { ethers } from "ethers"
import { useToken } from "wagmi"

const NativeTokens: Record<string, string> = {
  '1': 'ETH',
  '10': 'ETH'
}

const TokenAmount = ({ address, amount, chainId }: { address: `0x${string}`, amount: string, chainId: string }) => {

  const { data, isLoading } = address === ethers.constants.AddressZero ? { data: { symbol: NativeTokens[chainId], decimals: 18 }, isLoading: false } : useToken({
    address,
    chainId: Number(chainId),
    cacheTime: 200_000
  })

  return <span>{isLoading ? "" : `${ethers.utils.formatUnits(amount, data?.decimals)} ${data?.symbol}`}</span>
}

export default TokenAmount
