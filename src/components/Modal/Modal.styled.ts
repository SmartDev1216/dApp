import { DialogContent } from "@radix-ui/react-dialog"
import { IconButton } from "components/IconButton/IconButton"
import { GradientText } from "components/Typography/GradientText/GradientText"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { theme } from "theme"

const fadeInKeyframes = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }

  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`

export const ModalContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: ${theme.zIndices.backdrop};
`

export const ModalWindow = styled(DialogContent)<{ maxWidth?: number }>`
  background: ${theme.colors.backgroundGray900};
  height: 100vh;
  border: 1px solid rgba(${theme.rgbColors.white}, 0.06);
  box-shadow: 0px 38px 46px rgba(0, 0, 0, 0.03);
  width: 100%;
  z-index: ${theme.zIndices.modal};
  position: absolute;
  top: 0;

  @media ${theme.viewport.gte.sm} {
    max-width: ${(props) => `${props.maxWidth ?? 610}px`};
    height: auto;
    border-radius: 16px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  animation: 150ms cubic-bezier(0.16, 1, 0.3, 1) ${fadeInKeyframes};
`

export const ModalTitle = styled(GradientText)`
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
`
export const ModalBody = styled.div`
  padding: 0 30px 30px;

  max-height: 80vh;
  overflow-y: auto;

  &::-webkit-scrollbar-track {
    margin-bottom: 16px;
  }
`
export const IconsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  gap: 8px;

  @media ${theme.viewport.gte.sm} {
    justify-content: space-between;
  }
`
export const CloseButton = styled(IconButton)`
  @media ${theme.viewport.gte.sm} {
    margin-left: auto;
  }
`
