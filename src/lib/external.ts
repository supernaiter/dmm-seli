export function toSafeExternalUrl(value: string | null | undefined) {
  if (!value) return null

  try {
    const url = new URL(value)
    if (url.protocol !== "https:") return null
    return url.toString()
  } catch {
    return null
  }
}
