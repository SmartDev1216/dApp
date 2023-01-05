import { useOmnipoolAssets, useOmnipoolPositions } from "api/omnipool"
import { useMemo } from "react"
import { useAssetMetaList } from "api/assetMeta"
import { BN_0, BN_NAN, TRADING_FEE } from "utils/constants"
import BN from "bignumber.js"
import { u32 } from "@polkadot/types-codec"
import { useTokensBalances } from "api/balances"
import { useSpotPrices } from "api/spotPrice"
import { getFloatingPointAmount } from "utils/balance"
import {
  is_add_liquidity_allowed,
  is_buy_allowed,
  is_remove_liquidity_allowed,
  is_sell_allowed,
} from "@galacticcouncil/math/build/omnipool/bundler/hydra_dx_wasm"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { useApiIds } from "api/consts"
import { useAssetDetailsList } from "api/assetDetails"
import { getAssetName } from "components/AssetIcon/AssetIcon"
import { useUniques } from "api/uniques"
import { useAccountStore } from "state/store"

export const useOmnipoolPools = (withPositions?: boolean) => {
  const { account } = useAccountStore()
  const assets = useOmnipoolAssets()
  const assetDetails = useAssetDetailsList(assets.data?.map((a) => a.id) ?? [])
  const metas = useAssetMetaList(assets.data?.map((a) => a.id) ?? [])
  const apiIds = useApiIds()
  const spotPrices = useSpotPrices(
    assets.data?.map((a) => a.id) ?? [],
    apiIds.data?.usdId,
  )
  const balances = useTokensBalances(
    assets.data?.map((a) => a.id) ?? [],
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const uniques = useUniques(
    account?.address ?? "",
    apiIds.data?.omnipoolCollectionId ?? "",
  )
  const positions = useOmnipoolPositions(
    uniques.data?.map((u) => u.itemId) ?? [],
  )

  const queries = [
    assets,
    assetDetails,
    metas,
    apiIds,
    uniques,
    ...positions,
    ...spotPrices,
    ...balances,
  ]
  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const pools = useMemo(() => {
    if (
      !assets.data ||
      !assetDetails.data ||
      !metas.data ||
      !apiIds.data ||
      spotPrices.some((q) => !q.data) ||
      balances.some((q) => !q.data) ||
      positions.some((q) => !q.data)
    )
      return undefined

    const rows: OmnipoolPool[] = assets.data
      .map((asset) => {
        const details = assetDetails.data.find(
          (d) => d.id.toString() === asset.id.toString(),
        )
        const meta = metas.data?.find(
          (m) => m.id.toString() === asset.id.toString(),
        )
        const spotPrice = spotPrices.find(
          (sp) => sp.data?.tokenIn === asset.id.toString(),
        )?.data?.spotPrice
        const balance = balances.find(
          (b) => b.data?.assetId.toString() === asset.id.toString(),
        )?.data?.balance

        const id = asset.id
        const symbol = meta?.symbol ?? "N/A"
        const name = details?.name || getAssetName(meta?.symbol)
        const tradeFee = TRADING_FEE

        const total = getFloatingPointAmount(
          balance ?? BN_0,
          meta?.decimals?.toNumber() ?? 12,
        )
        const totalUSD = !spotPrice ? BN_NAN : total.times(spotPrice)

        const bits = asset.data.tradable.bits.toNumber()
        const canSell = is_sell_allowed(bits)
        const canBuy = is_buy_allowed(bits)
        const canAddLiquidity = is_add_liquidity_allowed(bits)
        const canRemoveLiquidity = is_remove_liquidity_allowed(bits)
        const hasPositions = positions.some(
          (p) => p.data?.assetId.toString() === id.toString(),
        )

        return {
          id,
          symbol,
          name,
          tradeFee,
          total,
          totalUSD,
          canSell,
          canBuy,
          canAddLiquidity,
          canRemoveLiquidity,
          hasPositions,
        }
      })
      .filter((x): x is OmnipoolPool => x !== null)

    return rows
  }, [
    assets.data,
    assetDetails.data,
    metas.data,
    apiIds.data,
    spotPrices,
    balances,
    positions,
  ])

  const data = useMemo(
    () => (withPositions ? pools?.filter((pool) => pool.hasPositions) : pools),
    [pools, withPositions],
  )

  return { data, isLoading: isInitialLoading }
}

export type OmnipoolPool = {
  id: u32
  symbol: string
  name: string
  tradeFee: BN
  total: BN
  totalUSD: BN
  canSell: boolean
  canBuy: boolean
  canAddLiquidity: boolean
  canRemoveLiquidity: boolean
  hasPositions: boolean
}
