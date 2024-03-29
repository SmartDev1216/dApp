import { FC } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"
import { Bell } from "./buttons/Bell"
import { Documentation } from "./buttons/Documentation"
import { MoreMenu } from "./buttons/MoreMenu"
import { Settings } from "./buttons/Settings"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"

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
      <Web3ConnectModalButton size="small" css={{ maxHeight: 40 }} />
      {!isSmallMedia && menuItems.length > 0 && <MoreMenu items={menuItems} />}
    </div>
  )
}
