const BRAZIL_TZ = "America/Sao_Paulo"

function formatPartsInBrazil(date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TZ,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

  return formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value
    }
    return acc
  }, {})
}

function getOffsetMinutesFor(date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: BRAZIL_TZ,
    timeZoneName: "shortOffset",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

  const parts = formatter.formatToParts(date)
  const offset = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT"
  const match = offset.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)

  if (!match) {
    return 0
  }

  const sign = match[1] === "-" ? -1 : 1
  const hours = Number(match[2] ?? 0)
  const minutes = Number(match[3] ?? 0)

  return sign * (hours * 60 + minutes)
}

export const BRAZIL_TIMEZONE = BRAZIL_TZ

export function toBrazilISOString(localDateTime) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(localDateTime)) {
    return null
  }

  const [datePart, timePart] = localDateTime.split("T")
  const [year, month, day] = datePart.split("-").map(Number)
  const [hour, minute] = timePart.split(":").map(Number)

  if ([year, month, day, hour, minute].some((value) => Number.isNaN(value))) {
    return null
  }

  const assumedUTC = new Date(Date.UTC(year, month - 1, day, hour, minute))
  const offsetMinutes = getOffsetMinutesFor(assumedUTC)

  return new Date(assumedUTC.getTime() - offsetMinutes * 60_000).toISOString()
}

export function formatBrazilDateTime(value, options) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "Data inválida"
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TZ,
    dateStyle: "short",
    timeStyle: "short",
    ...options,
  }).format(date)
}

export function getCurrentBrazilDateTimeLocal() {
  const parts = formatPartsInBrazil(new Date())
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}
