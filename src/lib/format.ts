export function formatYen(value: number | null): string {
  if (value == null) return "—"
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPointRate(rate: number | null): string {
  if (rate == null || rate <= 0) return "—"
  return `${Math.round(rate * 100)}%還元`
}

export function formatDiscount(rate: number | null): string {
  if (rate == null || rate <= 0) return "—"
  return `${Math.round(rate * 100)}%OFF`
}

export function formatUpdatedAt(value: string | null): string {
  if (!value) return "未取得"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed)
}

export function formatReleaseDate(value: string | null): string {
  if (!value) return "配信日情報なし"
  const parsed = new Date(value.replace(" ", "T"))
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed)
}
