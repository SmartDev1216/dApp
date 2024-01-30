import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { LiquidityPosition } from "./LiquidityPosition"
import ChartIcon from "assets/icons/ChartIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { TPoolDetails, TPoolFullData } from "sections/pools/PoolsPage.utils"

type Props = {
  positions: TPoolDetails["omnipoolNftPositions"]
  pool: TPoolFullData
  refetchPositions: () => void
}

export const LiquidityPositionWrapper = ({
  pool,
  positions,
  refetchPositions,
}: Props) => {
  const { t } = useTranslation()

  if (!positions.length) return null

  return (
    <div>
      <div sx={{ flex: "row", align: "center", gap: 8, mb: [17, 20] }}>
        <Icon size={13} sx={{ color: "pink600" }} icon={<ChartIcon />} />
        <Text fs={[16, 16]} color="pink600">
          {t("liquidity.asset.omnipoolPositions.title")}
        </Text>
      </div>
      <div sx={{ flex: "column", gap: 16 }}>
        {positions.map((position, i) => (
          <LiquidityPosition
            key={`${i}-${position.assetId}`}
            position={position}
            index={i + 1}
            onSuccess={refetchPositions}
            pool={pool}
          />
        ))}
      </div>
    </div>
  )
}
