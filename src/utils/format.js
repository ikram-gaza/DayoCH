const LOCALE = 'fr-FR'

export function formaterDate(valeur) {
  if (!valeur) return '-'
  const date = new Date(valeur)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString(LOCALE)
}

export function formaterDateHeure(valeur) {
  if (!valeur) return '-'
  const date = new Date(valeur)
  return Number.isNaN(date.getTime())
    ? '-'
    : date.toLocaleString(LOCALE, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
}

export function formaterDuree(mois) {
  if (!mois || mois < 1) return "moins d'un mois"
  const annees = Math.floor(mois / 12)
  const reste = mois % 12
  const morceaux = []
  if (annees) morceaux.push(`${annees} an${annees > 1 ? 's' : ''}`)
  if (reste) morceaux.push(`${reste} mois`)
  return morceaux.join(' et ')
}

export function initiales(prenom, nom) {
  return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase()
}
