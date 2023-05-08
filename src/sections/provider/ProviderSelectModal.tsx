import { PROVIDERS, useProviderRpcUrlStore } from "api/provider"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { Fragment, useEffect, useState } from "react"
import { theme } from "theme"

import { ReactComponent as ChevronRightIcon } from "assets/icons/ChevronRightIcon.svg"
import {
  SButton,
  SCircle,
  SContainer,
  SHeader,
  SItem,
  SName,
} from "./ProviderSelectModal.styled"
import { useTranslation } from "react-i18next"
import { useBestNumber } from "api/chain"
import { ApiPromise, WsProvider } from "@polkadot/api"
import { u32, u64 } from "@polkadot/types"
import { Controller, useForm } from "react-hook-form"
import { ProviderInput } from "./components/ProviderInput/ProviderInput"
import { useRpcStore } from "state/store"
import { FormValues } from "utils/helpers"
import { useMutation } from "@tanstack/react-query"
import { connectWsProvider } from "./ProviderSelectModal.utils"
import { ProviderStatus } from "./ProviderStatus"

function ProviderSelectItemExternal(props: {
  url: string
  className?: string
}) {
  const [bestNumberState, setBestNumberState] = useState<
    { relaychainBlockNumber: u32; timestamp: u64 } | undefined
  >(undefined)

  useEffect(() => {
    const rpc = props.url
    const provider = new WsProvider(rpc) //

    let cancel: () => void

    async function load() {
      const api = await ApiPromise.create({ provider })

      async function onNewBlock() {
        const [relay, timestamp] = await Promise.all([
          api.query.parachainSystem.validationData(),
          api.query.timestamp.now(),
        ])

        setBestNumberState({
          relaychainBlockNumber: relay.unwrap().relayParentNumber,
          timestamp: timestamp,
        })
      }

      api.on("connected", onNewBlock)
      api.rpc.chain
        .subscribeNewHeads(onNewBlock)
        .then((newCancel) => (cancel = newCancel))
    }

    load()

    return () => {
      cancel?.()
      provider.disconnect()
    }
  }, [props.url])

  return (
    <>
      {bestNumberState != null ? (
        <ProviderStatus
          timestamp={bestNumberState.timestamp}
          relaychainBlockNumber={bestNumberState.relaychainBlockNumber}
          className={props.className}
          side="left"
        />
      ) : (
        <span className={props.className} />
      )}
    </>
  )
}

function ProviderSelectItemLive(props: { className?: string }) {
  const number = useBestNumber()

  return (
    <>
      {number.data?.relaychainBlockNumber != null ? (
        <ProviderStatus
          timestamp={number.data.timestamp}
          relaychainBlockNumber={number.data?.relaychainBlockNumber}
          className={props.className}
          side="left"
        />
      ) : (
        <span className={props.className} />
      )}
    </>
  )
}

function ProviderSelectItem(props: {
  name: string
  url: string
  isActive?: boolean
  custom?: boolean
  onClick: () => void
}) {
  const { removeRpc } = useRpcStore()
  const store = useProviderRpcUrlStore()
  const rpcUrl = store.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL

  const isLive = props.url === rpcUrl

  return (
    <SItem isActive={props.isActive} onClick={props.onClick}>
      <div>
        <Text
          color={props.isActive ? "pink600" : "white"}
          css={{
            gridArea: "name",
            transition: `all ${theme.transitions.default}`,
          }}
        >
          {props.name}
        </Text>
        {/*add prevent */}
        {props.custom && (
          <Text fs={11} onClick={() => removeRpc(props.url)}>
            remove
          </Text>
        )}
      </div>
      {isLive ? (
        <ProviderSelectItemLive css={{ gridArea: "status" }} />
      ) : (
        <ProviderSelectItemExternal
          url={props.url}
          css={{ gridArea: "status" }}
        />
      )}
      <div
        css={{ gridArea: "url" }}
        sx={{
          textAlign: "right",
          flex: "row",
          align: "center",
          justify: "flex-end",
          gap: 16,
        }}
      >
        <Text
          font="ChakraPetch"
          fs={14}
          fw={500}
          tAlign="right"
          color={props.isActive ? "pink600" : "basic600"}
          css={{ transition: `all ${theme.transitions.default}` }}
        >
          {new URL(props.url).hostname}
        </Text>

        <SCircle />
      </div>
    </SItem>
  )
}

export function ProviderSelectModal(props: {
  open: boolean
  onClose: () => void
}) {
  const preference = useProviderRpcUrlStore()
  const activeRpcUrl = preference.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL
  const [userRpcUrl, setUserRpcUrl] = useState(activeRpcUrl)
  const { t } = useTranslation()
  const { rpcList, setRpcList } = useRpcStore()

  const form = useForm<{ address: string }>({
    defaultValues: { address: "" },
    mode: "onChange",
  })

  const mutation = useMutation(async (value: FormValues<typeof form>) => {
    try {
      const provider = await connectWsProvider(value.address)

      const api = await ApiPromise.create({
        provider,
      })

      const relay = await api.query.parachainSystem.validationData()
      const relayParentNumber = relay.unwrap().relayParentNumber

      if (relayParentNumber.toNumber()) {
        setRpcList([`wss://${value.address}`])
        form.reset()
      }

      //return true
    } catch (e) {
      if (e === "disconnected")
        form.setError("address", {
          message: "Provided rpc provider doesn't exist",
        })
      throw new Error("Provided rpc provider doesn't exist")
    }
  })

  if (mutation.error) console.log("error in mutation")

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title={t("rpc.change.modal.title")}
    >
      <form onSubmit={form.handleSubmit((a) => mutation.mutate(a))}>
        <Controller
          name="address"
          control={form.control}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <ProviderInput
              name={name}
              value={value}
              onChange={onChange}
              error={error?.message}
              button={
                <Button
                  size="small"
                  type="submit"
                  isLoading={mutation.isLoading}
                >
                  add
                </Button>
              }
            />
          )}
        />
      </form>

      <SContainer>
        <SHeader>
          <div css={{ gridArea: "name" }}>
            {t("rpc.change.modal.column.name")}
          </div>
          <div css={{ gridArea: "status" }}>
            {t("rpc.change.modal.column.status")}
          </div>
          <div css={{ gridArea: "url" }} sx={{ textAlign: "right" }}>
            {t("rpc.change.modal.column.rpc")}
          </div>
        </SHeader>

        {PROVIDERS.filter((provider) =>
          typeof provider.env === "string"
            ? provider.env === import.meta.env.VITE_ENV
            : provider.env.includes(import.meta.env.VITE_ENV),
        ).map((provider, index) => {
          return (
            <Fragment key={provider.url}>
              <ProviderSelectItem
                name={provider.name}
                url={provider.url}
                isActive={provider.url === userRpcUrl}
                onClick={() => setUserRpcUrl(provider.url)}
              />
              {index + 1 < PROVIDERS.length && (
                <Separator color="alpha0" opacity={0.06} />
              )}
            </Fragment>
          )
        })}

        {rpcList?.map((provider, index) => {
          return (
            <Fragment key={provider}>
              <ProviderSelectItem
                name={`Custom RPC #${index + 1}`}
                url={provider}
                isActive={provider === userRpcUrl}
                onClick={() => setUserRpcUrl(provider)}
                custom
              />
              {index + 1 < PROVIDERS.length && (
                <Separator color="alpha0" opacity={0.06} />
              )}
            </Fragment>
          )
        })}
      </SContainer>

      <Button
        variant="primary"
        sx={{ mt: 64, width: "100%" }}
        onClick={() => {
          preference.setRpcUrl(userRpcUrl)

          if (activeRpcUrl !== userRpcUrl) {
            window.location.reload()
          } else {
            props.onClose()
          }
        }}
      >
        {t("rpc.change.modal.save")}
      </Button>
    </Modal>
  )
}

export function ProviderSelectButton() {
  const [open, setOpen] = useState(false)
  const store = useProviderRpcUrlStore()

  const rpcUrl = store.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL
  const selectedProvider = PROVIDERS.find((provider) => provider.url === rpcUrl)
  const number = useBestNumber()

  return (
    <>
      <SButton tabIndex={0} onClick={() => setOpen(true)} whileHover="animate">
        <SName
          variants={{
            initial: { width: 0 },
            animate: { width: "auto" },
            exit: { width: 0 },
          }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        >
          <Text font="ChakraPetch" fs={11} fw={500}>
            {selectedProvider?.name}
          </Text>
          <ChevronRightIcon />
          <Separator orientation="vertical" sx={{ height: 14, mr: 10 }} />
        </SName>
        <ProviderStatus
          relaychainBlockNumber={number.data?.relaychainBlockNumber}
          timestamp={number.data?.timestamp}
        />
      </SButton>
      {open && (
        <ProviderSelectModal open={open} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
