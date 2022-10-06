import styled from "@emotion/styled"
import { css } from "@emotion/react"

export const SWalletButton = styled.button<{
  variant: string
}>`
  display: flex;
  align-items: center;

  gap: 16px;
  padding: 16px;

  border: none;
  border-radius: 12px;

  transition: background 0.2s ease-in-out;
  cursor: pointer;

  ${({ variant }) => {
    if (variant === "polkadot-js") {
      return css`
        background: hsla(33, 100%, 50%, 0.05);

        :hover {
          background: hsla(33, 100%, 50%, 0.1);
        }

        :active {
          background: hsla(33, 100%, 50%, 0.12);
        }
      `
    }

    if (variant === "talisman") {
      return css`
        background: hsla(75, 100%, 68%, 0.05);

        :hover {
          background: hsla(75, 100%, 68%, 0.1);
        }

        :active {
          background: hsla(75, 100%, 68%, 0.12);
        }
      `
    }

    if (variant === "subwallet-js") {
      return css`
        background: hsla(222, 100%, 50%, 0.05);

        :hover {
          background: hsla(222, 100%, 50%, 0.1);
        }

        :active {
          background: hsla(222, 100%, 50%, 0.12);
        }
      `
    }
  }}
`
