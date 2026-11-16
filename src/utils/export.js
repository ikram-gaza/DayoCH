function echapperCsv(valeur) {
  const texte = valeur === null || valeur === undefined ? '' : String(valeur)
  return `"${texte.replaceAll('"', '""')}"`
}

function echapperHtml(valeur) {
  return String(valeur ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function telechargerBlob(nom, blob) {
  const url = URL.createObjectURL(blob)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nom
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  URL.revokeObjectURL(url)
}

export function exporterTableau({ nom, titre, colonnes, lignes, format = 'csv' }) {
  if (format === 'csv') {
    const entete = colonnes.map((colonne) => echapperCsv(colonne.libelle)).join(';')
    const corps = lignes.map((ligne) =>
      colonnes.map((colonne) => echapperCsv(ligne[colonne.cle])).join(';'),
    )
    telechargerBlob(
      `${nom}.csv`,
      new Blob([`\uFEFF${[entete, ...corps].join('\r\n')}`], { type: 'text/csv;charset=utf-8' }),
    )
    return
  }

  const tableau = `
    <table>
      <thead><tr>${colonnes.map((colonne) => `<th>${echapperHtml(colonne.libelle)}</th>`).join('')}</tr></thead>
      <tbody>${lignes
        .map(
          (ligne) =>
            `<tr>${colonnes
              .map((colonne) => `<td>${echapperHtml(ligne[colonne.cle])}</td>`)
              .join('')}</tr>`,
        )
        .join('')}</tbody>
    </table>`

  if (format === 'xlsx') {
    const html = `<html><head><meta charset="utf-8"></head><body>${tableau}</body></html>`
    telechargerBlob(
      `${nom}.xls`,
      new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' }),
    )
    return
  }

  const fenetre = window.open('', '_blank', 'width=1024,height=768')
  if (!fenetre) {
    exporterTableau({ nom, titre, colonnes, lignes, format: 'csv' })
    return
  }

  fenetre.document.write(`
    <html>
      <head>
        <meta charset="utf-8">
        <title>${echapperHtml(titre)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1c1917; }
          h1 { font-size: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #d6d3d1; padding: 6px 8px; text-align: left; }
          th { background: #007fe1; color: white; }
        </style>
      </head>
      <body>
        <h1>${echapperHtml(titre)}</h1>
        ${tableau}
      </body>
    </html>
  `)
  fenetre.document.close()
  fenetre.focus()
  fenetre.print()
}
