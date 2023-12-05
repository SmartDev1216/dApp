import { Text } from "components/Typography/Text/Text"
import { ButtonHTMLAttributes, FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useCopyToClipboard } from "react-use"
import { LINKS } from "utils/navigation"
import { SCopyButton, SPathButton, SPreviewBox } from "./CodePreview.styled"

const SELECTABLE_URL_PATHS = [
  {
    tkey: "referrals.preview.url.trade",
    path: LINKS.swap,
  },
  {
    tkey: "referrals.preview.url.dcda",
    path: LINKS.dca,
  },
  {
    tkey: "referrals.preview.url.liquidty",
    path: LINKS.liquidity,
  },
  {
    tkey: "referrals.preview.url.referrals",
    path: LINKS.referrals,
  },
  {
    tkey: "referrals.preview.url.otc",
    path: LINKS.otc,
  },
  {
    tkey: "referrals.preview.url.bonds",
    path: LINKS.bonds,
  },
] as const

type Props = {
  code?: string
  disabled?: boolean
}

export const CodePreview: React.FC<Props> = ({ code, disabled = false }) => {
  const { t } = useTranslation()

  const hasCode = !!code
  const codePlaceholder = t("referrals.preview.code.placeholder")
  const codeDisplay = hasCode ? code : codePlaceholder

  const [urlPath, setUrlPath] = useState(SELECTABLE_URL_PATHS[0].path)

  const urlDomain = import.meta.env.VITE_DOMAIN_URL
  const urlQuery = `?referral=`
  const fullUrl = `${urlDomain}${urlPath}${urlQuery}${codeDisplay}`

  return (
    <div>
      <div
        sx={{ flex: ["column", "row"], gap: 16 }}
        css={
          disabled && {
            opacity: 0.3,
            pointerEvents: "none",
            userSelect: "none",
          }
        }
      >
        <div>
          <SPreviewBox>
            <Text>{t("referrals.preview.link.title")}</Text>
            <Text color="brightBlue300">
              {urlDomain}
              {urlPath}
              {urlQuery}
              <Text
                as="span"
                color={code ? "white" : "brightBlue300"}
                sx={{ display: "inline" }}
              >
                {codeDisplay}
              </Text>
            </Text>
            <CopyButton disabled={!hasCode} text={fullUrl} />
          </SPreviewBox>
          <div sx={{ flex: ["column", "row"], gap: 10, pl: 16, mt: 10 }}>
            <Text>{t("referrals.preview.url.title")}</Text>
            <div sx={{ flex: "row", flexWrap: "wrap", gap: 5 }}>
              {SELECTABLE_URL_PATHS.map(({ path, tkey }) => (
                <SPathButton
                  key={path}
                  active={urlPath === path}
                  size="micro"
                  onClick={() => setUrlPath(path)}
                >
                  {t(tkey)}
                </SPathButton>
              ))}
            </div>
          </div>
        </div>
        <div>
          <SPreviewBox>
            <Text>{t("referrals.preview.code.title")}</Text>
            <Text color="brightBlue300">{codeDisplay}</Text>
            <CopyButton disabled={!hasCode} text={code} />
          </SPreviewBox>
        </div>
      </div>
    </div>
  )
}

const CopyButton: FC<
  {
    text?: string
  } & ButtonHTMLAttributes<HTMLButtonElement>
> = ({ text, ...props }) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [, copyToClipboard] = useCopyToClipboard()

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => {
      setCopied(false)
    }, 5000)

    return () => clearTimeout(id)
  }, [copied])

  function copy() {
    if (text) {
      copyToClipboard(text)
      setCopied(true)
    }
  }

  return (
    <SCopyButton
      variant={copied ? "transparent" : "primary"}
      size="micro"
      onClick={copy}
      {...props}
    >
      {copied ? t("copied") : t("copy")}
    </SCopyButton>
  )
}
