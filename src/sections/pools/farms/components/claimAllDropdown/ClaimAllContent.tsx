import { forwardRef, useMemo } from "react"
import { ToastMessage, useAccountStore } from "state/store"
import { Trans, useTranslation } from "react-i18next"
import { useRpcProvider } from "providers/rpcProvider"
import { useClaimableAmount, useClaimAllMutation } from "utils/farms/claiming"
import { TOAST_MESSAGES } from "state/toasts"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { SClaimButton, SContent } from "./ClaimAllDrowpdown.styled"
import { Text } from "components/Typography/Text/Text"
import { Spacer } from "components/Spacer/Spacer"
import { Separator } from "components/Separator/Separator"
import { theme } from "theme"
import Skeleton from "react-loading-skeleton"

type Props = { onClose: () => void }

export const ClaimAllContent = forwardRef<HTMLDivElement, Props>(
  ({ onClose }, ref) => {
    const { account } = useAccountStore()
    const { t } = useTranslation()
    const { assets } = useRpcProvider()
    const claimable = useClaimableAmount()

    const { claimableAssets } = useMemo(() => {
      const claimableAssets = []

      for (let key in claimable.data?.assets) {
        const asset = assets.getAsset(key)

        claimableAssets.push({
          value: claimable.data?.assets[key],
          symbol: asset.symbol,
          decimals: asset.decimals,
        })
      }

      return { claimableAssets }
    }, [assets, claimable.data?.assets])

    const toast = TOAST_MESSAGES.reduce((memo, type) => {
      const msType = type === "onError" ? "onLoading" : type
      memo[type] = (
        <>
          <Trans i18nKey={`farms.claimCard.toast.${msType}`}>
            <span />
          </Trans>
          <DisplayValue value={claimable.data?.displayValue} type="token" />
        </>
      )
      return memo
    }, {} as ToastMessage)

    const claimAll = useClaimAllMutation(undefined, undefined, toast)

    return (
      <SContent
        ref={ref}
        initial={{ height: 0 }}
        animate={{ height: "auto" }}
        transition={{
          type: "spring",
          mass: 1,
          stiffness: 300,
          damping: 20,
          duration: 0.3,
        }}
        css={{ overflow: "hidden" }}
      >
        <div sx={{ p: 40, flex: "column" }}>
          <Text>{t("farms.claimCard.title")}</Text>
          <Spacer size={16} />
          {claimable.isLoading && <Skeleton height={25} width={150} />}
          {claimableAssets.map((claimableAsset, index) => (
            <div key={claimableAsset.symbol} sx={{ mt: 8 }}>
              <Text fs={19} lh={19} font="FontOver" sx={{ mb: 8 }}>
                {t("value.tokenWithSymbol", {
                  value: claimableAsset.value,
                  fixedPointScale: claimableAsset.decimals.toString(),
                  symbol: claimableAsset.symbol,
                })}
              </Text>
              {index < claimableAssets.length - 1 && (
                <Separator
                  css={{
                    background: `rgba(${theme.rgbColors.white}, 0.06)`,
                  }}
                />
              )}
            </div>
          ))}
          <Text fs={14} sx={{ mt: 6 }}>
            <Trans t={t} i18nKey="farms.claimCard.claim.usd">
              <DisplayValue value={claimable.data?.displayValue} />
            </Trans>
          </Text>
          <Spacer size={18} />
          <SClaimButton
            disabled={
              !claimable.data ||
              claimable.data.displayValue.isZero() ||
              account?.isExternalWalletConnected
            }
            onClick={() => {
              claimAll.mutate()
              onClose()
            }}
          >
            <Text fs={13} tTransform="uppercase" tAlign="center">
              {t("farms.claimCard.button.label")}
            </Text>
          </SClaimButton>
        </div>
      </SContent>
    )
  },
)
