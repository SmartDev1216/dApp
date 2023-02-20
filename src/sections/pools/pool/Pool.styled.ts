import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  width: calc(100% + 24px);

  border-radius: 4px;
  background-color: ${theme.colors.darkBlue700};
  box-shadow: ${theme.shadows.contentBox};

  overflow: hidden;

  margin: 0 -12px;

  position: relative;

  :before {
    content: "";
    position: absolute;
    inset: 0;

    border-radius: 4px;
    padding: 1px; // a width of the border

    background: linear-gradient(
      180deg,
      rgba(102, 151, 227, 0.35) 0%,
      rgba(68, 109, 174, 0.3) 66.67%,
      rgba(91, 151, 245, 0) 99.99%,
      rgba(158, 167, 180, 0) 100%
    );

    -webkit-mask: linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  @media (${theme.viewport.gte.sm}) {
    margin: unset;
    width: 100%;
  }
`

export const SGridContainer = styled.div`
  position: relative;

  display: grid;
  grid-column-gap: 0px;
  grid-row-gap: 18px;

  padding: 20px;

  @media ${theme.viewport.gte.sm} {
    padding: 30px;

    display: grid;
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 48px;
    grid-row-gap: 0px;
    grid-template-columns: 1fr auto auto;

    > div:nth-of-type(1) {
      grid-area: 1 / 1 / 2 / 2;
    }
    > div:nth-of-type(2) {
      grid-area: 1 / 2 / 3 / 3;
    }
    > div:nth-of-type(3) {
      grid-area: 2 / 1 / 3 / 2;
    }
    > div:nth-of-type(4) {
      grid-area: 1 / 3 / 3 / 4;
    }
  }
`

export const SPositions = styled.div`
  background: rgba(${theme.rgbColors.darkBlue900}, 0.4);
  width: 100%;
  padding: 20px 12px;

  @media (${theme.viewport.gte.sm}) {
    padding: 20px 30px;
  }
`
