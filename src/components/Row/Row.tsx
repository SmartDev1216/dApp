import { Box } from "components/Box/Box"
import { Text } from "components/Typography/Text/Text"
import { FC, ReactNode } from "react"
import { SRightSide } from "./Row.styled"

type RowProps = {
  left: string
  right: ReactNode
}

export const Row: FC<RowProps> = ({ left, right }) => (
  <Box flex spread acenter mb={6} mt={6}>
    <Text fs={14} lh={22} color="neutralGray300">
      {left}
    </Text>
    <SRightSide flex acenter>
      {right}
    </SRightSide>
  </Box>
)
