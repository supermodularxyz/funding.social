export const formatImageURL = (url: string) => {
  if (url.includes('ipfs://')) {
    return `https://${url.replace('ipfs://', '')}.ipfs.dweb.link`
  } else {
    return url
  }
}

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}
