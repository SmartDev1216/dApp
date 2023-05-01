import { SContainer, SInput } from "./ProviderInput.styled"
import { ChangeEvent, ReactNode } from "react"
import { ReactComponent as PlusIcon } from "assets/icons/PlusIcon.svg"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { SErrorMessage } from "components/AddressInput/AddressInput.styled"

type ProviderInputProps = {
  name: string
  value: string
  error?: string
  button: ReactNode

  onChange: (v: ChangeEvent<HTMLInputElement>) => void
}

export const ProviderInput = ({
  name,
  value,
  error,
  onChange,
  button,
}: ProviderInputProps) => {
  return (
    <>
      <SContainer error={!!error}>
        <Icon sx={{ color: "basic500" }} icon={<PlusIcon />} />
        <Text color="basic500" fs={12}>
          wss://
        </Text>
        <SInput
          name={name}
          value={value}
          onChange={onChange}
          placeholder="Add custom RPC"
          autoComplete="off"
        />
        {button}
      </SContainer>
      {error && <SErrorMessage>{error}</SErrorMessage>}
    </>
  )
}
