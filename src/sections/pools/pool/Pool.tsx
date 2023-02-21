import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { SContainer, SGridContainer } from "./Pool.styled"
import { PoolDetails } from "./details/PoolDetails"
import { PoolValue } from "./details/PoolValue"
import { useState } from "react"
import { PoolActions } from "./actions/PoolActions"
import { useMedia } from "react-use"
import { theme } from "theme"
import { AnimatePresence, motion } from "framer-motion"
import { PoolFooter } from "./footer/PoolFooter"
import { PoolIncentives } from "./details/PoolIncentives"
import { usePoolPositions } from "sections/pools/pool/Pool.utils"
import { PoolCapacity } from "sections/pools/pool/capacity/PoolCapacity"
import { LiquidityPositionWrapper } from "./positions/LiquidityPositionWrapper"
import { FarmingPositionWrapper } from "../farms/FarmingPositionWrapper"

type Props = { pool: OmnipoolPool }

export const Pool = ({ pool }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const positions = usePoolPositions(pool)

  return (
    <SContainer id={pool.id.toString()}>
      <SGridContainer>
        <PoolDetails pool={pool} />
        <PoolIncentives />
        <PoolValue pool={pool} />
        <PoolActions
          pool={pool}
          refetch={positions.refetch}
          canExpand={!positions.isLoading && !!positions.data?.length}
          isExpanded={isExpanded}
          onExpandClick={() => setIsExpanded((prev) => !prev)}
        />
      </SGridContainer>
      <PoolCapacity pool={pool} />
      {isDesktop && !!positions.data?.length && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              css={{ overflow: "hidden" }}
            >
              <LiquidityPositionWrapper positions={positions} />
              <FarmingPositionWrapper positions={{ data: [""] }} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {isDesktop && pool.hasPositions && <PoolFooter pool={pool} />}
    </SContainer>
  )
}
