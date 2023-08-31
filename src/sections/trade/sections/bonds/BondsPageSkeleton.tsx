import { Heading } from "components/Typography/Heading/Heading"
import { useTranslation } from "react-i18next"
import { WhyBonds } from "./components/WhyBonds"
import { BondListSkeleton } from "./list/BondListSkeleton"
import { Skeleton as BondTableSkeleton } from "./table/skeleton/Skeleton"

export const BondsPageSkeleton = () => {
  const { t } = useTranslation()

  return (
    <>
      <Heading fs={19} sx={{ mb: 33 }}>
        {t("bonds.title")}
      </Heading>
      <WhyBonds />
      <BondListSkeleton />
      <BondTableSkeleton title={t("bonds.table.title")} />
    </>
  )
}
