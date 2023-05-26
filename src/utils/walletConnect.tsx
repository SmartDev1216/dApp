import Client from "@walletconnect/sign-client"
import { Web3Modal } from "@web3modal/standalone"
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

export const WALLET_CONNECT_PROJECT_ID = "c47a5369367ec2dad6b49c478eb772f9"
export const WALLET_CONNECT_RELAY_URL = "wss://relay.walletconnect.com"
export const HDX_CAIP_ID = "afdc188f45c71dacbaa0b62e16a91f72"

const web3modal = new Web3Modal({
  projectId: WALLET_CONNECT_PROJECT_ID,
  walletConnectVersion: 2,
})

export type WalletConnectCtx = { connect: () => Promise<void> }
export const WalletConnectContext = createContext<WalletConnectCtx>({
  connect: async () => {},
})
export const useWalletConnect = () => useContext(WalletConnectContext)

export const WalletConnectProvider = ({ children }: PropsWithChildren) => {
  const [client, setClient] = useState<Client>()

  const initClient = useCallback(async () => {
    try {
      const _client = await Client.init({
        projectId: WALLET_CONNECT_PROJECT_ID,
        relayUrl: WALLET_CONNECT_RELAY_URL,
      })
      setClient(_client)
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    if (!client) initClient()
  }, [initClient, client])

  const connect = useCallback(async () => {
    if (!client) return

    const params = {
      requiredNamespaces: {
        polkadot: {
          methods: ["polkadot_signTransaction", "polkadot_signMessage"],
          chains: [`polkadot:${HDX_CAIP_ID}`],
          events: ["chainChanged", "accountsChanged"],
        },
      },
    }
    try {
      const { uri, approval } = await client.connect(params)

      if (uri) web3modal.openModal({ uri })

      const session = await approval()
      const account = Object.values(session.namespaces)
        .map((namespace) => namespace.accounts)
        .flat()
      console.log("account:", account)

      web3modal.closeModal()
    } catch (e) {
      console.error(e)
    }
  }, [client])

  return (
    <WalletConnectContext.Provider value={{ connect }}>
      {children}
    </WalletConnectContext.Provider>
  )
}
