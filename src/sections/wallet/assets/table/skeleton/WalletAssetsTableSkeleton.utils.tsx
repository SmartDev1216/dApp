import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useMemo } from "react"

export const useAssetsTableSkeleton = (enableAnimation = true) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    name: true,
    transferable: true,
    total: isDesktop,
    actions: true,
  }

  const columns = useMemo(
    () => [
      display({
        id: "name",
        header: t("wallet.assets.table.header.name"),
        cell: () => (
          <div sx={{ flex: "row", gap: 8, height: [24, 32] }}>
            <div sx={{ width: [24, 32] }}>
              <Skeleton
                width="100%"
                height="100%"
                enableAnimation={enableAnimation}
              />
            </div>
            <Skeleton
              width={64}
              height="100%"
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "transferable",
        header: t("wallet.assets.table.header.transferable"),
        cell: () => (
          <div>
            <Skeleton
              width={134}
              height={32}
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "total",
        header: t("wallet.assets.table.header.total"),
        cell: () => (
          <div
            sx={{ width: [90, 134], height: [24, 32], ml: ["auto", "initial"] }}
          >
            <Skeleton
              width="100%"
              height="100%"
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "actions",
        cell: () => (
          <div sx={{ flex: "row", gap: 8, mr: 32, display: ["none", "flex"] }}>
            <Skeleton
              width={72}
              height={32}
              enableAnimation={enableAnimation}
            />
            <Skeleton
              width={72}
              height={32}
              enableAnimation={enableAnimation}
            />
            <Skeleton
              width={32}
              height={32}
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enableAnimation],
  )

  return useReactTable({
    data: mockData,
    columns,
    state: { columnVisibility },
    getCoreRowModel: getCoreRowModel(),
  })
}

const mockData = [1, 2, 3, 4]
