import { useReferendums } from "api/democracy"
import { ReferendumCard } from "components/ReferendumCard/ReferendumCard"
import { ReferendumCardSkeleton } from "components/ReferendumCard/ReferendumCardSkeleton"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer } from "sections/staking/StakingPage.styled"
import { ReactComponent as GovernanceIcon } from "assets/icons/GovernanceIcon.svg"
import { Icon } from "components/Icon/Icon"

type ReferendaProps = {
  loading: boolean
  data?: ReturnType<typeof useReferendums>["data"]
}

export const ReferendaWrapper = () => {
  const referendums = useReferendums()

  return <Referenda data={referendums.data} loading={referendums.isLoading} />
}

export const Referenda = ({ data, loading }: ReferendaProps) => {
  const { t } = useTranslation()

  return (
    <SContainer sx={{ p: [24, "25px 20px 20px"], gap: 21 }}>
      <Text font="FontOver" fs={19} tTransform="uppercase">
        {t("stats.overview.referenda.title")}
      </Text>
      {loading ? (
        <ReferendumCardSkeleton type="staking" />
      ) : data?.length ? (
        <div sx={{ flex: "column", gap: 16 }}>
          {data.map((referendum) => (
            <ReferendumCard
              key={referendum.id}
              type="staking"
              {...referendum}
            />
          ))}
        </div>
      ) : (
        <div sx={{ flex: "row", align: "center", gap: 16, my: 16 }}>
          <Icon icon={<GovernanceIcon />} />
          <Text color="basic700">
            {t("stats.overview.referenda.emptyState")}
          </Text>
        </div>
      )}
    </SContainer>
  )
}