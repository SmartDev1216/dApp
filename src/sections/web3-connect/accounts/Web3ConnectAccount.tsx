import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"
import { Account } from "sections/web3-connect/store/useWeb3ConnectStore"
import { getAddressVariants, isHydraAddress } from "utils/formatting"
import { SAccountItem } from "./Web3ConnectAccount.styled"
import { Web3ConnectAccountSelect } from "./Web3ConnectAccountSelect"
import { genesisHashToChain } from "utils/helpers"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import BN from "bignumber.js"
import { availableNetworks } from "@polkadot/networks"

type Props = Account & {
  isProxy?: boolean
  isActive?: boolean
  balance?: BN
  onClick?: (account: Account) => void
}

const hydradxInfo = availableNetworks.find((c) => c.network === "hydradx")

export const Web3ConnectAccount: FC<Props> = ({
  isProxy = false,
  isActive = false,
  onClick,
  balance,
  ...account
}) => {
  const { t } = useTranslation()
  const { address, name, displayAddress, provider, genesisHash } = account

  const { hydraAddress } = getAddressVariants(address)

  const chain = genesisHashToChain(genesisHash)

  const addr = displayAddress || hydraAddress
  const isHydraAddr = addr && isHydraAddress(addr)

  return (
    <SAccountItem
      isActive={isActive}
      isProxy={!!isProxy}
      onClick={() => onClick?.(account)}
    >
      <div sx={{ flex: "row", align: "center", justify: "space-between" }}>
        <Text font="ChakraPetchBold">{name}</Text>
        {balance?.isFinite() && (
          <div sx={{ flex: "row", align: "end", gap: 2 }}>
            <Text color="basic200" fw={400}>
              <DisplayValue value={balance} />
            </Text>
          </div>
        )}
      </div>

      {isProxy && (
        <>
          <Separator sx={{ my: 14 }} />
          <div>
            <Trans t={t} i18nKey="walletConnect.accountSelect.proxyAccount">
              <Text
                color="pink500"
                fs={14}
                font="ChakraPetchBold"
                css={{ display: "inline-block" }}
              />
              <Text color="pink500" fs={14} css={{ display: "inline-block" }} />
            </Trans>
          </div>
        </>
      )}
      <div sx={{ flex: "column", mt: 12, gap: 12 }}>
        <Web3ConnectAccountSelect
          name={
            isHydraAddr && hydradxInfo
              ? hydradxInfo?.displayName
              : chain?.displayName ?? ""
          }
          address={addr}
          genesisHash={genesisHash}
          provider={provider}
          isProxy={isProxy}
        />
      </div>
    </SAccountItem>
  )
}
