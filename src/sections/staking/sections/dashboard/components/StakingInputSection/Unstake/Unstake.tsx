import { GradientText } from "components/Typography/GradientText/GradientText"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useAccountStore, useStore } from "state/store"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { Text } from "components/Typography/Text/Text"
import { AssetSelectSkeleton } from "components/AssetSelect/AssetSelectSkeleton"
import { UnstakeAssetSelect } from "./UnstakeAssetSelect"
import { Spacer } from "components/Spacer/Spacer"
import { NATIVE_ASSET_ID, useApiPromise } from "utils/api"
import { useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"

export const Unstake = ({
  loading,
  staked,
  stakingId,
}: {
  loading: boolean
  stakingId?: number
  staked: BigNumber
}) => {
  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const api = useApiPromise()
  const { createTransaction } = useStore()

  const { account } = useAccountStore()
  const form = useForm<{ amount: string }>({
    defaultValues: {
      amount: staked.toString(),
    },
  })

  const onSubmit = async () => {
    await createTransaction({
      tx: api.tx.staking.unstake(stakingId),
    })

    await queryClient.refetchQueries({
      queryKey: [
        QUERY_KEYS.staking,
        QUERY_KEYS.circulatingSupply,
        QUERY_KEYS.stakingPosition(stakingId),
      ],
    })
  }

  return (
    <div sx={{ flex: "column" }}>
      <GradientText
        gradient="pinkLightBlue"
        fs={19}
        sx={{ width: "fit-content" }}
      >
        {t("staking.dashboard.form.unstake.title")}
      </GradientText>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
        sx={{
          flex: "column",
          justify: "space-between",
          minHeight: "100%",
        }}
      >
        <Controller
          name="amount"
          control={form.control}
          rules={{
            required: t("wallet.assets.transfer.error.required"),
            validate: {
              validNumber: (value) => {
                try {
                  if (!new BigNumber(value).isNaN()) return true
                } catch {}
                return t("error.validNumber")
              },
              positive: (value) =>
                new BigNumber(value).gt(0) || t("error.positive"),
            },
          }}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) =>
            loading ? (
              <AssetSelectSkeleton
                title={t("staking.dashboard.form.stake.inputTitle")}
                name={name}
                balanceLabel={t("staking.dashboard.form.unstake.balanceLabel")}
              />
            ) : (
              <UnstakeAssetSelect
                title={t("staking.dashboard.form.stake.inputTitle")}
                name={name}
                value={value}
                onChange={onChange}
                assetId={NATIVE_ASSET_ID}
                error={error?.message}
              />
            )
          }
        />

        <Spacer size={20} />

        {account ? (
          <Button
            variant="blue"
            type="submit"
            disabled={loading || staked.isZero()}
          >
            {t("staking.dashboard.form.unstake.button")}
          </Button>
        ) : (
          <WalletConnectButton />
        )}

        <Text color="brightBlue200Alpha" fs={14} sx={{ p: 10 }}>
          {t("staking.dashboard.form.unstake.msg")}
        </Text>
      </form>
    </div>
  )
}
