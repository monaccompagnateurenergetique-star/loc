export function formatCurrency(amount) {
  if (amount == null) return '0,00 €'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateLong(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatPercent(value) {
  if (value == null) return '0 %'
  return `${Number(value).toFixed(1)} %`
}

export function formatSurface(m2) {
  if (!m2) return '-'
  return `${Number(m2).toLocaleString('fr-FR')} m²`
}

export function formatPhoneNumber(phone) {
  if (!phone) return '-'
  return phone.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
}
