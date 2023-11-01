import { useTokensBalances } from "api/balances"
import { useOmnipoolAssets } from "api/omnipool"
import { useMemo } from "react"
import { useAssetsTradability } from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { useAccountStore } from "state/store"
import { NATIVE_ASSET_ID, OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { getFloatingPointAmount, normalizeBigNumber } from "utils/balance"
import { BN_0, BN_MILL, BN_NAN } from "utils/constants"
import { useDisplayPrices } from "utils/displayAsset"
import { useStableswapPools } from "api/stableswap"
import { pool_account_name } from "@galacticcouncil/math-stableswap"
import { encodeAddress, blake2AsHex } from "@polkadot/util-crypto"
import { HYDRADX_SS58_PREFIX } from "@galacticcouncil/sdk"
import { useAccountsBalances } from "api/accountBalances"
import { useRpcProvider } from "providers/rpcProvider"
import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { isNotNil, undefinedNoop } from "utils/helpers"
import { ApiPromise } from "@polkadot/api"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import {
  getVolumeAssetTotalValue,
  useAllStableswapTrades,
  useAllTradesSorted,
} from "api/volume"
import BN from "bignumber.js"

export type TOmnipoolAsset = NonNullable<
  ReturnType<typeof useOmnipoolAndStablepool>["data"]
>[number]

export type TOmnipoolNftPosition =
  TOmnipoolAsset["omnipoolNftPositions"][number]

export type TMiningNftPosition = TOmnipoolAsset["miningNftPositions"][number]

export const useOmnipoolAndStablepool = (withPositions?: boolean) => {
  const { assets } = useRpcProvider()
  const { account } = useAccountStore()

  const allTrades = useAllTradesSorted()

  const omnipoolAssets = useOmnipoolAssets()
  const assetsTradability = useAssetsTradability()

  const accountOmnipoolPositions = useAccountOmnipoolPositions()

  const miningPositions = useAccountMiningPositions()

  const assetsId = useMemo(
    () => omnipoolAssets.data?.map((a) => a.id.toString()) ?? [],
    [omnipoolAssets.data],
  )

  const omnipoolBalances = useTokensBalances(assetsId, OMNIPOOL_ACCOUNT_ADDRESS)

  const stablepools = useStableswapPools()

  const stablepoolIds = useMemo(
    () => stablepools.data?.map((stablepool) => stablepool.id) ?? [],
    [stablepools.data],
  )

  const stablepoolAddressById = useMemo(
    () =>
      new Map(
        stablepoolIds.map((stablepoolId) => [
          stablepoolId,
          derivePoolAccount(stablepoolId),
        ]),
      ),
    [stablepoolIds],
  )

  const stablepoolsBalances = useAccountsBalances(
    Array.from(stablepoolAddressById.values()),
  )

  const assetsByStablepool = [
    ...new Set(
      stablepools.data
        ?.map((stablepool) =>
          stablepool.data.assets.map((asset) => asset.toString()),
        )
        .flat(),
    ),
  ]

  const stablepoolUserPositions = useTokensBalances(
    stablepoolIds,
    account?.address,
  )

  const spotPrices = useDisplayPrices([...assetsId, ...assetsByStablepool])

  const omnipoolPositions = useOmnipoolPositionsData()

  const queries = [
    omnipoolAssets,
    spotPrices,
    accountOmnipoolPositions,
    omnipoolPositions,
    assetsTradability,
    ...stablepoolUserPositions,
    ...omnipoolBalances,
  ]

  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !omnipoolAssets.data ||
      !spotPrices.data ||
      !accountOmnipoolPositions ||
      !omnipoolPositions.data ||
      !assetsTradability.data ||
      omnipoolBalances.some((q) => !q.data)
    )
      return undefined

    const rows = assetsId
      .map((assetId) => {
        const meta = assets.getAsset(assetId)
        const isStablepool = assets.isStableSwap(meta)

        const stablepool = stablepools.data?.find(
          (stablepool) => stablepool.id === assetId,
        )

        const spotPrice = spotPrices.data?.find((sp) => sp?.tokenIn === assetId)
          ?.spotPrice

        const omnipoplBalance = omnipoolBalances.find(
          (b) => b.data?.assetId.toString() === assetId,
        )?.data?.balance

        const stablepoolBalance = isStablepool
          ? stablepoolsBalances.data?.find(
              (stablepoolBalance) =>
                stablepoolBalance.accountId ===
                stablepoolAddressById.get(assetId),
            )
          : undefined

        const stablepoolBalanceByAsset = new Map(
          (stablepoolBalance?.balances ?? []).map((balance) => {
            const id = balance.id.toString()
            const spotPrice = spotPrices.data?.find((sp) => sp?.tokenIn === id)
              ?.spotPrice
            const decimals = normalizeBigNumber(assets.getAsset(id).decimals)

            const free = normalizeBigNumber(balance.data.free)

            const value =
              spotPrice && !spotPrice.isNaN()
                ? free.shiftedBy(decimals.negated().toNumber()).times(spotPrice)
                : BN_0

            return [id, { free, value }]
          }),
        )

        const stablepoolTotal = Array.from(
          stablepoolBalanceByAsset.entries(),
        ).reduce(
          (acc, [, balance]) => ({
            free: acc.free.plus(balance.free),
            value: acc.value.plus(balance.value),
          }),
          { free: BN_0, value: BN_0 },
        )

        const stablepoolUserPosition = stablepoolUserPositions.find(
          (stablepoolUserPosition) =>
            stablepoolUserPosition.data?.assetId.toString() === assetId,
        )

        const reserves = Array.from(stablepoolBalanceByAsset.entries()).map(
          ([assetId, balance]) => ({
            asset_id: Number(assetId),
            decimals: assets.getAsset(assetId).decimals,
            amount: balance.free.toString(),
          }),
        )

        const tradabilityData = assetsTradability.data?.find(
          (t) => t.id === assetId,
        )

        const total = getFloatingPointAmount(
          omnipoplBalance ?? BN_0,
          meta.decimals,
        )
        const totalDisplay = !spotPrice ? BN_NAN : total.times(spotPrice)

        const omnipoolNftPositions = omnipoolPositions.data.filter(
          (position) => position.assetId === assetId,
        )

        const miningNftPositions = miningPositions
          .filter(
            (position) => position.data?.data.ammPoolId.toString() === assetId,
          )
          .map((position) => position.data)
          .filter(isNotNil)

        const isOmnipoolNftPositions = !!omnipoolNftPositions.length
        const isMiningNftPositions = !!miningNftPositions.length

        const trades = allTrades.data?.[assetId]
        const volume = trades
          ? getVolumeAssetTotalValue({
              events: trades,
              assetId: assetId,
            })?.[assetId]
          : BN_0

        const volumeDisplay = volume
          ? volume.multipliedBy(spotPrice ?? 1).shiftedBy(-meta.decimals)
          : undefined

        const tradability = {
          canBuy: !!tradabilityData?.canBuy,
          canSell: !!tradabilityData?.canSell,
          canAddLiquidity: !!tradabilityData?.canAddLiquidity,
          canRemoveLiquidity: !!tradabilityData?.canRemoveLiquidity,
        }

        return {
          id: assetId,
          symbol: meta.symbol,
          name: meta.name,
          total,
          totalDisplay,
          omnipoolNftPositions,
          miningNftPositions,
          isOmnipoolNftPositions,
          isMiningNftPositions,
          trades,
          spotPrice,
          volume,
          volumeDisplay,
          tradability,
          reserves,
          stablepoolTotal,
          isStablepool,
          stablepoolBalanceByAsset,
          stablepoolFee: stablepool?.data.fee
            ? normalizeBigNumber(stablepool?.data.fee).div(BN_MILL)
            : undefined,
          stablepoolUserPosition: stablepoolUserPosition?.data?.freeBalance,
          assets: stablepool?.data.assets.map((asset) => asset.toString()),
        }
      })
      ?.filter(isNotNil)

    return rows
  }, [
    omnipoolAssets.data,
    spotPrices.data,
    accountOmnipoolPositions,
    omnipoolPositions.data,
    assetsTradability.data,
    omnipoolBalances,
    assetsId,
    assets,
    stablepools.data,
    stablepoolsBalances.data,
    stablepoolUserPositions,
    miningPositions,
    allTrades.data,
    stablepoolAddressById,
  ])?.filter((pool) =>
    withPositions
      ? pool.isMiningNftPositions ||
        pool.isOmnipoolNftPositions ||
        pool.stablepoolUserPosition?.gt(0)
      : true,
  )

  data?.sort((poolA, poolB) => {
    if (poolA.id.toString() === NATIVE_ASSET_ID) {
      return -1
    }

    if (poolB.id.toString() === NATIVE_ASSET_ID) {
      return 1
    }

    return poolA.totalDisplay.gt(poolB.totalDisplay) ? -1 : 1
  })

  return { data, isLoading: isInitialLoading }
}

export const derivePoolAccount = (assetId: string) => {
  const name = pool_account_name(Number(assetId))
  return encodeAddress(blake2AsHex(name), HYDRADX_SS58_PREFIX)
}

export const useAccountOmnipoolPositions = () => {
  const { account } = useAccountStore()
  const { api } = useRpcProvider()

  const address = account?.address

  return useQuery(
    QUERY_KEYS.accountOmnipoolPositions(address),
    address != null
      ? async () => {
          const [omnipoolNftId, miningNftId] = await Promise.all([
            api.consts.omnipool.nftCollectionId,
            api.consts.omnipoolLiquidityMining.nftCollectionId,
          ])

          const [omnipoolNftsRaw, miningNftsRaw] = await Promise.all([
            api.query.uniques.account.entries(address, omnipoolNftId),
            api.query.uniques.account.entries(address, miningNftId),
          ])

          const omnipoolNfts = omnipoolNftsRaw.map(([storageKey]) => {
            const [owner, classId, instanceId] = storageKey.args
            return {
              owner: owner.toString(),
              classId: classId.toString(),
              instanceId: instanceId.toString(),
            }
          })

          const miningNfts = miningNftsRaw.map(([storageKey]) => {
            const [owner, classId, instanceId] = storageKey.args
            return {
              owner: owner.toString(),
              classId: classId.toString(),
              instanceId: instanceId.toString(),
            }
          })

          return { omnipoolNfts, miningNfts }
        }
      : undefinedNoop,
    { enabled: !!address },
  )
}

export const useAccountMiningPositions = () => {
  const { api } = useRpcProvider()
  const { data } = useAccountOmnipoolPositions()

  return useQueries({
    queries: data?.miningNfts
      ? data.miningNfts.map((nft) => ({
          queryKey: QUERY_KEYS.miningPosition(nft.instanceId),
          queryFn: getMiningPosition(api, nft.instanceId),
          enabled: !!nft.instanceId,
        }))
      : [],
  })
}

const getMiningPosition = (api: ApiPromise, id: string) => async () => {
  const dataRaw = await api.query.omnipoolWarehouseLM.deposit(id)
  const data = dataRaw.unwrap()

  return { id, data }
}

export const useStableswapVolume = () => {
  const { assets } = useRpcProvider()
  const stableswapTrades = useAllStableswapTrades()
  const ids = Object.keys(stableswapTrades.data ?? {})
  const spotPrices = useDisplayPrices(ids)

  const isLoading = spotPrices.isInitialLoading || stableswapTrades.isLoading

  const data = useMemo(() => {
    if (ids.length) {
      let assetsTotal = BN_0

      for (const assestId in stableswapTrades.data) {
        const meta = assets.getAsset(assestId)
        const sporPrice = spotPrices.data?.find(
          (sporPrice) => sporPrice?.tokenIn === assestId,
        )

        if (meta && sporPrice) {
          const total = stableswapTrades.data[assestId].reduce(
            (acc, trade) =>
              acc.plus(
                BN(trade.args.amountIn)
                  .shiftedBy(-meta.decimals)
                  .multipliedBy(sporPrice.spotPrice),
              ),
            BN_0,
          )

          if (!total.isZero()) assetsTotal = assetsTotal.plus(total)
        }
      }

      return assetsTotal
    }
    return BN_0
  }, [assets, ids.length, spotPrices.data, stableswapTrades.data])

  return { data, isLoading }
}
