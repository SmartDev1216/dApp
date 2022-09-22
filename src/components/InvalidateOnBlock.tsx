import { BlockNumber } from "@polkadot/types/interfaces"
import { isCompact } from "@polkadot/util"
import { useQueryClient } from "@tanstack/react-query"
import { ReactNode, useEffect } from "react"
import { useApiPromise } from "utils/network"
import { QUERY_KEYS, QUERY_KEY_PREFIX } from "utils/queryKeys"

export const InvalidateOnBlock = (props: { children: ReactNode }) => {
  const api = useApiPromise()
  const queryClient = useQueryClient()

  useEffect(() => {
    let cancel: () => void

    api.rpc.chain
      .subscribeNewHeads((hdr) => {
        const blockNumber = isCompact<BlockNumber>(hdr.number)
          ? hdr.number.unwrap()
          : hdr.number

        console.log(blockNumber.toHuman())

        queryClient.setQueryData(QUERY_KEYS.bestNumber, blockNumber)
        queryClient.invalidateQueries([QUERY_KEY_PREFIX])
      })
      .then((newCancel) => (cancel = newCancel))

    return () => cancel?.()
  }, [api, queryClient])

  return <>{props.children}</>
}