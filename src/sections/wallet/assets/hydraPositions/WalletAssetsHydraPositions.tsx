import { useTranslation } from "react-i18next"
import { Fragment, useState } from "react"
import {
  Table,
  TableBodyContent,
  TableContainer,
  TableHeaderContent,
  TableRow,
  TableTitle,
} from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { TableSortHeader } from "components/Table/Table"
import { flexRender } from "@tanstack/react-table"
import {
  HydraPositionsTableData,
  useHydraPositionsTable,
} from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { EmptyState } from "./EmptyState"
import { STableData } from "./WalletHydraPositions.styled"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import { useMedia } from "react-use"
import { theme } from "theme"
import { HydraPositionsDetailsMob } from "./details/HydraPositionsDetailsMob"
import { TXYKPosition } from "./data/WalletAssetsHydraPositionsData.utils"

type Props = { data: (HydraPositionsTableData | TXYKPosition)[] }

export const WalletAssetsHydraPositions = ({ data }: Props) => {
  const { t } = useTranslation()

  const [row, setRow] = useState<
    HydraPositionsTableData | TXYKPosition | undefined
  >(undefined)

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const table = useHydraPositionsTable(data)

  return (
    <>
      <TableContainer css={assetsTableStyles}>
        <TableTitle>
          <Text
            fs={[16, 20]}
            lh={[20, 26]}
            css={{ fontFamily: "FontOver" }}
            fw={500}
            color="white"
          >
            {t("wallet.assets.hydraPositions.title")}
          </Text>
        </TableTitle>
        <Table>
          <TableHeaderContent>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableSortHeader
                    key={header.id}
                    canSort={header.column.getCanSort()}
                    sortDirection={header.column.getIsSorted()}
                    onSort={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableSortHeader>
                ))}
              </TableRow>
            ))}
          </TableHeaderContent>
          <TableBodyContent>
            {table.options.data.length ? (
              table.getRowModel().rows.map((row, i) => (
                <Fragment key={row.id}>
                  <TableRow
                    isOdd={!(i % 2)}
                    onClick={() => {
                      !isDesktop && setRow(row.original)
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <STableData key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </STableData>
                    ))}
                  </TableRow>
                </Fragment>
              ))
            ) : (
              <EmptyState />
            )}
          </TableBodyContent>
        </Table>
      </TableContainer>
      {!isDesktop && (
        <HydraPositionsDetailsMob row={row} onClose={() => setRow(undefined)} />
      )}
    </>
  )
}
