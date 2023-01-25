import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { ReactComponent as TransferIcon } from "assets/icons/TransferIcon.svg"
import { ReactComponent as SellIcon } from "assets/icons/SellIcon.svg"
import { ReactComponent as BuyIcon } from "assets/icons/BuyIcon.svg"
import { ReactComponent as DollarIcon } from "assets/icons/DollarIcon.svg"
import { WalletAssetsTableName } from "../data/WalletAssetsTableData"
import { Separator } from "components/Separator/Separator"
import { theme } from "theme"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { AssetsTableData } from "../WalletAssetsTable.utils"
import { SActionButtonsContainer } from "./WalletAssetsTable.styled"
import { useSetAsFeePayment } from "api/payments"
import { useNavigate } from "@tanstack/react-location"

type Props = {
  row?: AssetsTableData
  onClose: () => void
  onTransferClick: (id: string) => void
}

export const WalletAssetsTableActionsMob = ({
  row,
  onClose,
  onTransferClick,
}: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const setFeeAsPayment = useSetAsFeePayment()

  if (!row) return null

  return (
    <Modal open={!!row} isDrawer onClose={onClose}>
      <div>
        <div sx={{ pb: 30 }}>
          <WalletAssetsTableName {...row} large />
        </div>
        <Separator
          css={{ background: `rgba(${theme.rgbColors.alpha0}, 0.06)` }}
        />
        <div sx={{ flex: "row", justify: "space-between", py: 30 }}>
          <div sx={{ flex: "column", gap: 4 }}>
            <Text fs={14} lh={16} color="whiteish500">
              {t("wallet.assets.table.header.total")}
            </Text>
            <Text fs={14} lh={14} color="white">
              {t("value", { value: row.total })}
            </Text>
            <Text fs={12} lh={17} color="whiteish500">
              {t("value.usd", { amount: row.totalUSD })}
            </Text>
          </div>
          <div sx={{ flex: "column", gap: 4 }}>
            <Text fs={14} lh={16} color="whiteish500">
              {t("wallet.assets.table.header.transferable")}
            </Text>
            <Text fs={14} lh={14} color="white">
              {t("value", { value: row.transferable })}
            </Text>
            <Text fs={12} lh={17} color="whiteish500">
              {t("value.usd", { amount: row.transferableUSD })}
            </Text>
          </div>
        </div>
        <SActionButtonsContainer>
          <div sx={{ flex: "row", justify: "space-between" }}>
            <div sx={{ flex: "column", gap: 4, pt: 20, pb: 30 }}>
              <Text fs={14} lh={16} color="whiteish500">
                {t("wallet.assets.table.details.lockedDemocracy")}
              </Text>
              <Text fs={14} lh={14} color="white">
                {t("value", { value: row.lockedDemocracy })}
              </Text>
              <Text fs={12} lh={17} color="whiteish500">
                {t("value.usd", { amount: row.lockedDemocracyUSD })}
              </Text>
            </div>
            <div sx={{ flex: "column", gap: 4, pt: 20, pb: 30 }}>
              <Text fs={14} lh={16} color="whiteish500">
                {t("wallet.assets.table.details.lockedVesting")}
              </Text>
              <Text fs={14} lh={14} color="white">
                {t("value", { value: row.lockedVesting })}
              </Text>
              <Text fs={12} lh={17} color="whiteish500">
                {t("value.usd", { amount: row.lockedVestingUSD })}
              </Text>
            </div>
          </div>
          <div sx={{ flex: "column", gap: 12 }}>
            <div>
              <div sx={{ flex: "row", gap: 12 }}>
                <Button
                  sx={{ width: "100%" }}
                  size="small"
                  onClick={
                    row.tradability.inTradeRouter && row.tradability.canBuy
                      ? () =>
                          navigate({
                            to: "/trade",
                            search: { assetOut: row.id },
                          })
                      : undefined
                  }
                >
                  <BuyIcon />
                  {t("wallet.assets.table.actions.buy")}
                </Button>
                <Button
                  sx={{ width: "100%" }}
                  size="small"
                  onClick={
                    row.tradability.inTradeRouter && row.tradability.canSell
                      ? () =>
                          navigate({
                            to: "/trade",
                            search: { assetIn: row.id },
                          })
                      : undefined
                  }
                >
                  <SellIcon />
                  {t("wallet.assets.table.actions.sell")}
                </Button>
              </div>
            </div>
            <div>
              <Button
                sx={{ width: "100%" }}
                size="small"
                onClick={() => onTransferClick(row.id)}
              >
                <TransferIcon />
                {t("wallet.assets.table.actions.transfer")}
              </Button>
            </div>
            {row.couldBeSetAsPaymentFee && (
              <div>
                <Button
                  sx={{ width: "100%" }}
                  size="small"
                  onClick={() => setFeeAsPayment(row.id)}
                >
                  <DollarIcon />
                  {t("wallet.assets.table.actions.payment.asset")}
                </Button>
              </div>
            )}
          </div>
        </SActionButtonsContainer>
      </div>
    </Modal>
  )
}
