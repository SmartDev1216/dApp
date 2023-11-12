import { encodeAddress, decodeAddress } from "@polkadot/util-crypto"
import { Buffer } from "buffer"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"

export {
  isAddress as isEvmAddress,
  getAddress as getEvmAddress,
} from "@ethersproject/address"

export const NATIVE_EVM_ASSET_SYMBOL = "WETH"
export const NATIVE_EVM_ASSET_DECIMALS = 18

export function isEvmAccount(address?: string) {
  if (!address) return false

  try {
    const { prefixBytes } = H160
    const pub = decodeAddress(address, true)
    return Buffer.from(pub.subarray(0, prefixBytes.length)).equals(prefixBytes)
  } catch {
    return false
  }
}

export class H160 {
  static prefixBytes = Buffer.from("ETH\0")
  address: string

  constructor(address: string) {
    this.address = address
  }

  toAccount = () => {
    const addressBytes = Buffer.from(this.address.slice(2), "hex")
    return encodeAddress(
      new Uint8Array(
        Buffer.concat([H160.prefixBytes, addressBytes, Buffer.alloc(8)]),
      ),
      HYDRA_ADDRESS_PREFIX,
    )
  }

  static fromAccount = (address: string) => {
    const decodedBytes = decodeAddress(address)
    const addressBytes = decodedBytes.slice(H160.prefixBytes.length, -8)
    return "0x" + Buffer.from(addressBytes).toString("hex")
  }
}

export function getEvmTxLink(txHash: string) {
  return `${import.meta.env.VITE_EVN_EXPLORER_URL}/tx/${txHash}`
}
