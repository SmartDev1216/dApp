import { SubscriptionFn, Wallet, WalletAccount } from "@talismn/connect-wallets"
import MetaMaskLogo from "assets/icons/MetaMask.svg"
import { MetaMaskSigner } from "sections/web3-connect/wallets/MetaMask/MetaMaskSigner"
import { shortenAccountAddress } from "utils/formatting"
import { noop } from "utils/helpers"
import { MetaMaskProvider, isMetaMask } from "utils/metamask"

type ChainSubscriptionFn = (payload: number | null) => void | Promise<void>

type MetamaskInit = {
  onAccountsChanged?: SubscriptionFn
  onChainChanged?: ChainSubscriptionFn
}

export class MetaMask implements Wallet {
  extensionName = "metamask"
  title = "MetaMask"
  installUrl = "https://metamask.io/download"
  logo = {
    src: MetaMaskLogo,
    alt: "MetaMask Logo",
  }

  _extension: Required<MetaMaskProvider> | undefined
  _signer: MetaMaskSigner | undefined

  onAccountsChanged: SubscriptionFn | undefined
  onChainChanged: ChainSubscriptionFn | undefined

  constructor(
    { onAccountsChanged, onChainChanged }: MetamaskInit = {
      onAccountsChanged: noop,
      onChainChanged: noop,
    },
  ) {
    this.onAccountsChanged = onAccountsChanged
    this.onChainChanged = onChainChanged
  }

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  get installed() {
    return isMetaMask(window.ethereum)
  }

  get rawExtension() {
    return window.ethereum
  }

  transformError = (err: Error): Error => {
    return new Error(err.message)
  }

  enable = async (dappName: string) => {
    if (!dappName) {
      throw new Error("MissingParamsError: Dapp name is required.")
    }

    try {
      if (!isMetaMask(window.ethereum)) return

      const metamask = window.ethereum

      const addresses = await metamask.request({
        method: "eth_requestAccounts",
        params: [],
      })

      const address =
        Array.isArray(addresses) && addresses.length > 0 ? addresses[0] : ""

      this._extension = metamask
      this._signer = address ? new MetaMaskSigner(address, metamask) : undefined

      this.subscribeAccounts(this.onAccountsChanged)
      this.subscribeChain(this.onChainChanged)
    } catch (err: any) {
      // don't treat pending requests as errors
      if (err.code === -32002) {
        return
      }
      throw this.transformError(err as Error)
    }
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    if (!this._extension) {
      throw new Error(
        `The 'Wallet.enable(dappname)' function should be called first.`,
      )
    }

    const accounts = (await this._extension.request({
      method: "eth_requestAccounts",
      params: [],
    })) as string[]

    return (accounts || [])
      .filter((address): address is string => !!address)
      .map(this.toWalletAccount)
  }

  toWalletAccount = (address: string): WalletAccount => {
    return {
      address,
      source: this.extensionName,
      name: shortenAccountAddress(address),
      wallet: this,
      signer: this.signer,
    }
  }

  subscribeAccounts = async (callback?: SubscriptionFn) => {
    if (!this._extension) {
      throw new Error(
        `The 'Wallet.enable(dappname)' function should be called first.`,
      )
    }

    this._extension.on("accountsChanged", (payload) => {
      const addresses = Array.isArray(payload)
        ? payload.map((item: string) => item)
        : []

      const accounts = addresses.map(this.toWalletAccount)
      callback?.(accounts)

      const mainAccount = accounts.slice(0, 1)[0]
      this._signer?.setAddress(mainAccount?.address)
    })
  }

  subscribeChain = async (callback?: ChainSubscriptionFn) => {
    if (!this._extension) {
      throw new Error(
        `The 'Wallet.enable(dappname)' function should be called first.`,
      )
    }

    this._extension.on("chainChanged", async (payload) => {
      const chainId = typeof payload === "string" ? parseInt(payload) : null
      callback?.(chainId)
    })
  }

  unsubscribe = () => {
    this._extension?.removeAllListeners()
    this._extension = undefined
    this._signer = undefined
  }
}
