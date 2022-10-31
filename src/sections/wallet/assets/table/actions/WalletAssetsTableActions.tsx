import { ReactComponent as BuyIcon } from "assets/icons/BuyIcon.svg"
import { ReactComponent as SellIcon } from "assets/icons/SellIcon.svg"
import { ReactComponent as TransferIcon } from "assets/icons/TransferIcon.svg"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"
import { ReactComponent as ChevronIcon } from "assets/icons/ChevronDown.svg"
import { useTranslation } from "react-i18next"
import { TableAction } from "components/Table/Table"

type Props = { toggleExpanded: () => void; symbol: string }

export const WalletAssetsTableActions = ({ toggleExpanded, symbol }: Props) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "row", gap: 10 }}>
      <TableAction
        icon={<BuyIcon />}
        onClick={() => console.log("buy", symbol)}
      >
        {t("wallet.assets.table.actions.buy")}
      </TableAction>
      <TableAction
        icon={<SellIcon />}
        onClick={() => console.log("sell", symbol)}
      >
        {t("wallet.assets.table.actions.sell")}
      </TableAction>
      <TableAction
        icon={<TransferIcon />}
        onClick={() => console.log("transfer", symbol)}
      >
        {t("wallet.assets.table.actions.transfer")}
      </TableAction>
      <ButtonTransparent
        onClick={toggleExpanded}
        css={{ color: theme.colors.iconGray }}
      >
        <ChevronIcon />
      </ButtonTransparent>
    </div>
  )
}
