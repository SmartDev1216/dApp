import { flexRender } from "@tanstack/react-table"
import { Switch } from "components/Switch/Switch"
import { TableSortHeader } from "components/Table/Table"
import {
  Table,
  TableBodyContent,
  TableContainer,
  TableData,
  TableHeaderContent,
  TableRow,
  TableTitle,
} from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { Fragment, useState } from "react"
import { useTranslation } from "react-i18next"
import { WalletAssetsTableDetails } from "sections/wallet/assets/table/details/WalletAssetsTableDetails"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import {
  AssetsTableData,
  useAssetsTable,
} from "sections/wallet/assets/table/WalletAssetsTable.utils"
import { WalletTransferModal } from "sections/wallet/transfer/WalletTransferModal"

type Props = { data: AssetsTableData[] }

export const WalletAssetsTable = ({ data }: Props) => {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)

  const [transferAsset, setTransferAsset] = useState<string | null>(null)
  const table = useAssetsTable(data, {
    onTransfer: setTransferAsset,
  })

  return (
    <TableContainer css={assetsTableStyles}>
      <TableTitle>
        <Text
          fs={[16, 19]}
          lh={[20, 24.7]}
          css={{ fontFamily: "FontOver" }}
          fw={500}
          color="white"
        >
          {t("wallet.assets.table.title")}
        </Text>
        <Switch
          value={showAll}
          onCheckedChange={(value) => setShowAll(value)}
          size="small"
          name="showAll"
          label={t("wallet.assets.table.toggle")}
        />
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
          {table.getRowModel().rows.map((row, i) => (
            <Fragment key={row.id}>
              <TableRow isOdd={!(i % 2)}>
                {row.getVisibleCells().map((cell) => (
                  <TableData key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableData>
                ))}
              </TableRow>
              {row.getIsExpanded() && (
                <TableRow isSub>
                  <TableData colSpan={table.getAllColumns().length}>
                    <WalletAssetsTableDetails
                      origin={row.original.origin}
                      locked={row.original.locked}
                      lockedUSD={row.original.lockedUSD}
                    />
                  </TableData>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBodyContent>
      </Table>
      {transferAsset && (
        <WalletTransferModal
          open
          initialAsset={transferAsset}
          onClose={() => setTransferAsset(null)}
        />
      )}
    </TableContainer>
  )
}
