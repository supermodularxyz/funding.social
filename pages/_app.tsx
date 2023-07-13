import "@/styles/global.css";
import '@rainbow-me/rainbowkit/styles.css';

import { LensConfig, LensProvider, sources, development, production, appId } from '@lens-protocol/react-web';
import { bindings as wagmiBindings } from '@lens-protocol/wagmi';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets, } from '@rainbow-me/rainbowkit';
// import { metaMaskWallet, safeWallet } from '@rainbow-me/rainbowkit/wallets'
import type { AppProps } from 'next/app';
import React from 'react';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { polygonMumbai, polygon, mainnet, optimism } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, optimism, polygon, polygonMumbai],
  [publicProvider()],
);

const { wallets } = getDefaultWallets({
  appName: 'Grants Friends',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? "",
  chains,
});

const connectors = connectorsForWallets(wallets)

const client = createClient({
  autoConnect: true,
  provider,
  connectors,
  webSocketProvider,
});

const lensConfig: LensConfig = {
  bindings: wagmiBindings(),
  // environment: development,
  environment: production,
  sources: [sources.lenster, sources.orb],
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <RainbowKitProvider chains={chains}>
        <LensProvider config={lensConfig}>
          <Component {...pageProps} />
        </LensProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
