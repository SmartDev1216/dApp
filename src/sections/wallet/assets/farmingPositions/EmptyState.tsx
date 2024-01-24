import styled from "@emotion/styled"
import { useNavigate } from "@tanstack/react-location"
import EmptyStateIcon from "assets/icons/FarmsEmpty.svg?react"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

const SEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 17px;

  min-height: 250px;
  width: 100%;
`

export const EmptyState = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <tr sx={{ height: 250 }}>
      <td colSpan={4}>
        <SEmptyState>
          <EmptyStateIcon />
          <Text
            fs={14}
            color="basic700"
            tAlign="center"
            sx={{ maxWidth: 290, mb: 10 }}
          >
            {t("wallet.assets.farmingPositions.empty.desc")}
          </Text>
          <Button
            onClick={() =>
              navigate({
                to: "/liquidity",
              })
            }
          >
            {t("wallet.assets.farmingPositions.empty.btn")}
          </Button>
        </SEmptyState>
      </td>
    </tr>
  )
}
