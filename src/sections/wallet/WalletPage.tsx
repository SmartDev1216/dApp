import { useMatchRoute } from "@tanstack/react-location"
import { Page } from "components/Layout/Page/Page"
import { WalletAssets } from "sections/wallet/assets/WalletAssets"
import { LINKS } from "utils/navigation"
import { WalletVesting } from "./vesting/WalletVesting"
import { Navigation } from "sections/wallet/navigation/Navigation"

export const WalletPage = () => {
  const matchRoute = useMatchRoute()

  return (
    <Page subHeader={<Navigation />}>
      {matchRoute({ to: LINKS.walletVesting }) && <WalletVesting />}
      {matchRoute({ to: LINKS.walletAssets }) && <WalletAssets />}
    </Page>
  )
}
