import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz"

export const BRAZIL_TIMEZONE = "America/Sao_Paulo"

export function getCurrentBrazilDateTimeLocal(): string {
  return formatInTimeZone(new Date(), BRAZIL_TIMEZONE, "yyyy-MM-dd'T'HH:mm")
}

export function toBrazilISOString(localDateTime: string): string | null {
  try {
    return zonedTimeToUtc(localDateTime, BRAZIL_TIMEZONE).toISOString()
  } catch (error) {
    console.error("Failed to convert Brazil datetime:", error)
    return null
  }
}

export function formatBrazilDateTime(
  value: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "Data inválida"
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIMEZONE,
    dateStyle: "short",
    timeStyle: "short",
    ...options,
  }).format(date)
}
