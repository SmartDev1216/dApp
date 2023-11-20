import { FC } from "react"
import { useMedia } from "react-use"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { theme } from "theme"
import { Bell } from "./buttons/Bell"
import { Documentation } from "./buttons/Documentation"
import { MoreMenu } from "./buttons/MoreMenu"
import { Settings } from "./buttons/Settings"

const settingsEanbled = import.meta.env.VITE_FF_SETTINGS_ENABLED === "true"

type Props = {
  menuItems: string[]
}

export const HeaderToolbar: FC<Props> = ({ menuItems }) => {
  const isSmallMedia = useMedia(theme.viewport.lt.sm)

  return (
    <div sx={{ flex: "row", align: "center", gap: 14 }}>
      <div sx={{ flex: "row", gap: 10 }}>
        {!isSmallMedia && <Documentation />}
        <Bell />
        {!isSmallMedia && settingsEanbled && <Settings />}
      </div>
      <WalletConnectButton />
      {!isSmallMedia && menuItems.length > 0 && <MoreMenu items={menuItems} />}
    </div>
  )
}
