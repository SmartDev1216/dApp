import BuyIcon from "assets/icons/BuyIcon.svg?react"
import ChevronDownIcon from "assets/icons/ChevronDown.svg?react"
import MoreIcon from "assets/icons/MoreDotsIcon.svg?react"
import SellIcon from "assets/icons/SellIcon.svg?react"
import TransferIcon from "assets/icons/TransferIcon.svg?react"
import MetamaskLogo from "assets/icons/MetaMask.svg?react"
//import ClaimIcon from "assets/icons/ClaimIcon.svg?react"
import DollarIcon from "assets/icons/DollarIcon.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import { Dropdown } from "components/Dropdown/Dropdown"
import { TableAction } from "components/Table/Table"
import { Trans, useTranslation } from "react-i18next"
import { theme } from "theme"
import { isNotNil } from "utils/helpers"
import { useSetAsFeePayment } from "api/payments"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { isMetaMaskInstalled, watchAsset } from "utils/metamask"
import { NATIVE_EVM_ASSET_SYMBOL, isEvmAccount } from "utils/evm"

type Props = {
  toggleExpanded: () => void
  symbol: string
  decimals: number
  id: string
  onBuyClick: (() => void) | undefined
  onSellClick: (() => void) | undefined
  onTransferClick: () => void
  couldBeSetAsPaymentFee: boolean
  isExpanded: boolean
}

export const WalletAssetsTableActions = (props: Props) => {
  const { t } = useTranslation()
  const setFeeAsPayment = useSetAsFeePayment()
  const { account } = useAccount()

  const couldWatchMetaMaskAsset =
    isMetaMaskInstalled &&
    isEvmAccount(account?.address) &&
    props.symbol !== NATIVE_EVM_ASSET_SYMBOL

  const actionItems = [
    /*{
      key: "add",
      icon: <ClaimIcon />,
      label: t("wallet.assets.table.actions.claim"),
    },*/
    props.couldBeSetAsPaymentFee
      ? {
          key: "setAsFeePayment",
          icon: <DollarIcon />,
          label: t("wallet.assets.table.actions.payment.asset"),
        }
      : null,
    couldWatchMetaMaskAsset
      ? {
          key: "watch",
          icon: <MetamaskLogo width={18} height={18} />,
          label: t("wallet.assets.table.actions.watch"),
        }
      : null,
  ].filter(isNotNil)

  return (
    <>
      <div
        sx={{
          flex: "row",
          gap: 10,
          display: ["none", "flex"],
          align: "center",
        }}
      >
        <TableAction
          icon={<BuyIcon />}
          onClick={props.onBuyClick}
          disabled={
            props.onBuyClick == null || account?.isExternalWalletConnected
          }
        >
          {t("wallet.assets.table.actions.buy")}
        </TableAction>
        <TableAction
          icon={<SellIcon />}
          onClick={props.onSellClick}
          disabled={
            props.onSellClick == null || account?.isExternalWalletConnected
          }
        >
          {t("wallet.assets.table.actions.sell")}
        </TableAction>
        <TableAction
          icon={<TransferIcon />}
          onClick={props.onTransferClick}
          disabled={account?.isExternalWalletConnected}
        >
          {t("wallet.assets.table.actions.transfer")}
        </TableAction>

        <Dropdown
          items={account?.isExternalWalletConnected ? [] : actionItems}
          onSelect={(item) => {
            if (item === "setAsFeePayment") {
              setFeeAsPayment(props.id, {
                onLoading: (
                  <Trans
                    t={t}
                    i18nKey="wallet.assets.table.actions.payment.toast.onLoading"
                    tOptions={{
                      asset: props.symbol,
                    }}
                  >
                    <span />
                    <span className="highlight" />
                  </Trans>
                ),
                onSuccess: (
                  <Trans
                    t={t}
                    i18nKey="wallet.assets.table.actions.payment.toast.onSuccess"
                    tOptions={{
                      asset: props.symbol,
                    }}
                  >
                    <span />
                    <span className="highlight" />
                  </Trans>
                ),
                onError: (
                  <Trans
                    t={t}
                    i18nKey="wallet.assets.table.actions.payment.toast.onLoading"
                    tOptions={{
                      asset: props.symbol,
                    }}
                  >
                    <span />
                    <span className="highlight" />
                  </Trans>
                ),
              })
            }

            if (item === "watch") {
              watchAsset(props.id, {
                symbol: props.symbol,
                decimals: props.decimals,
              })
            }
          }}
        >
          <MoreIcon />
        </Dropdown>

        <ButtonTransparent
          onClick={props.toggleExpanded}
          css={{
            color: theme.colors.iconGray,
            opacity: props.isExpanded ? "1" : "0.5",
            transform: props.isExpanded ? "rotate(180deg)" : undefined,
          }}
        >
          <ChevronDownIcon />
        </ButtonTransparent>
      </div>
    </>
  )
}
