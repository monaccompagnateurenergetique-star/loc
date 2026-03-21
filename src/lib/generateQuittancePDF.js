import jsPDF from 'jspdf'

/**
 * Generate a French "Quittance de Loyer" PDF for an invoice.
 *
 * @param {Object} params
 * @param {Object} params.invoice - The invoice object
 * @param {Object} params.tenant - The tenant object
 * @param {Object} params.property - The property object
 * @param {Object} params.structure - The structure (owner/SCI) object
 * @param {Object} params.lease - The lease object
 */
export function generateQuittancePDF({ invoice, tenant, property, structure, lease }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const marginL = 20
  const marginR = 20
  const contentW = pageW - marginL - marginR
  let y = 20

  // --- Helper ---
  const fmt = (amount) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0)

  const addLine = (text, x, size = 10, style = 'normal') => {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
    doc.text(text, x, y)
    y += size * 0.45
  }

  const drawHLine = () => {
    doc.setDrawColor(180)
    doc.setLineWidth(0.3)
    doc.line(marginL, y, pageW - marginR, y)
    y += 4
  }

  // ========== HEADER ==========
  doc.setFillColor(37, 47, 63) // dark navy
  doc.rect(0, 0, pageW, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('QUITTANCE DE LOYER', pageW / 2, 18, { align: 'center' })

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(invoice.period_label || '', pageW / 2, 28, { align: 'center' })

  doc.setFontSize(9)
  doc.text(`N° ${invoice.id || ''}`, pageW / 2, 35, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  y = 50

  // ========== BAILLEUR (owner/structure) ==========
  doc.setFillColor(245, 247, 250)
  doc.roundedRect(marginL, y - 4, contentW / 2 - 5, 40, 2, 2, 'F')
  doc.roundedRect(pageW / 2 + 5, y - 4, contentW / 2 - 5, 40, 2, 2, 'F')

  // Left block: Bailleur
  let bx = marginL + 4
  let by = y
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 100, 100)
  doc.text('BAILLEUR', bx, by)
  by += 5
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(structure?.name || '-', bx, by)
  by += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  if (structure?.address || structure?.address_line1) {
    doc.text(structure.address || structure.address_line1, bx, by)
    by += 4
  }
  if (structure?.postal_code || structure?.city) {
    doc.text(`${structure.postal_code || ''} ${structure.city || ''}`.trim(), bx, by)
    by += 4
  }
  if (structure?.siret) {
    doc.setFontSize(8)
    doc.text(`SIRET: ${structure.siret}`, bx, by)
  }

  // Right block: Locataire
  let tx = pageW / 2 + 9
  let ty = y
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 100, 100)
  doc.text('LOCATAIRE', tx, ty)
  ty += 5
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  const tenantName = tenant ? `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() : '-'
  doc.text(tenantName, tx, ty)
  ty += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  if (property?.address || property?.address_line1) {
    doc.text(property.address || property.address_line1, tx, ty)
    ty += 4
  }
  if (property?.postal_code || property?.city) {
    doc.text(`${property.postal_code || ''} ${property.city || ''}`.trim(), tx, ty)
  }

  y += 44

  // ========== BIEN CONCERNE ==========
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 100, 100)
  doc.text('BIEN CONCERNE', marginL, y)
  y += 5
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(property?.name || '-', marginL, y)
  y += 5
  if (property?.address || property?.address_line1) {
    doc.setFontSize(9)
    doc.text(
      `${property.address || property.address_line1}${property.city ? ', ' + (property.postal_code || '') + ' ' + property.city : ''}`,
      marginL,
      y
    )
    y += 5
  }
  const details = []
  if (property?.surface || property?.surface_m2) details.push(`${property.surface || property.surface_m2} m²`)
  if (property?.rooms || property?.nb_rooms) details.push(`${property.rooms || property.nb_rooms} piece(s)`)
  if (property?.floor != null) details.push(`Etage ${property.floor}`)
  if (details.length > 0) {
    doc.setFontSize(9)
    doc.text(details.join('  |  '), marginL, y)
    y += 4
  }

  y += 4
  drawHLine()

  // ========== DETAIL FINANCIER ==========
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Detail financier', marginL, y)
  y += 8

  // Table header
  doc.setFillColor(37, 47, 63)
  doc.rect(marginL, y - 4, contentW, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Description', marginL + 4, y)
  doc.text('Montant', pageW - marginR - 4, y, { align: 'right' })
  y += 7
  doc.setTextColor(0, 0, 0)

  // Rows
  const rows = []
  rows.push({ label: 'Loyer HT', amount: invoice.rent_ht })

  if (invoice.tva_rate > 0 && invoice.tva_amount > 0) {
    rows.push({ label: `TVA (${invoice.tva_rate}%)`, amount: invoice.tva_amount })
    rows.push({ label: 'Loyer TTC', amount: invoice.rent_ttc, bold: true })
  }

  if (invoice.charges > 0) {
    const chargesLabel = lease?.charges_type === 'forfait' ? 'Charges (forfait)' : 'Provision sur charges'
    rows.push({ label: chargesLabel, amount: invoice.charges })
  }

  rows.forEach((row, i) => {
    const bgColor = i % 2 === 0 ? 250 : 255
    doc.setFillColor(bgColor, bgColor, bgColor)
    doc.rect(marginL, y - 3.5, contentW, 7, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', row.bold ? 'bold' : 'normal')
    doc.text(row.label, marginL + 4, y)
    doc.text(fmt(row.amount), pageW - marginR - 4, y, { align: 'right' })
    y += 7
  })

  // Total row
  y += 2
  doc.setFillColor(37, 47, 63)
  doc.rect(marginL, y - 4, contentW, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL TTC', marginL + 4, y + 1)
  doc.text(fmt(invoice.total_ttc), pageW - marginR - 4, y + 1, { align: 'right' })
  y += 12
  doc.setTextColor(0, 0, 0)

  // ========== PERIODE & PAIEMENT ==========
  y += 4
  doc.setFillColor(245, 247, 250)
  doc.roundedRect(marginL, y - 4, contentW, 22, 2, 2, 'F')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const periodStart = invoice.period_start ? new Date(invoice.period_start).toLocaleDateString('fr-FR') : '-'
  const periodEnd = invoice.period_end ? new Date(invoice.period_end).toLocaleDateString('fr-FR') : '-'
  doc.text(`Periode : du ${periodStart} au ${periodEnd}`, marginL + 4, y + 2)
  doc.text(
    `Date d'echeance : ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : '-'}`,
    marginL + 4,
    y + 8
  )

  if (invoice.status === 'paid') {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 163, 74)
    doc.text(`Paye integralement le ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : '-'}`, marginL + 4, y + 14)
    doc.setTextColor(0, 0, 0)
  } else if (invoice.status === 'partially_paid') {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(234, 88, 12)
    doc.text(`Partiellement paye : ${fmt(invoice.paid_amount)} / ${fmt(invoice.total_ttc)}`, marginL + 4, y + 14)
    doc.setTextColor(0, 0, 0)
  } else {
    doc.text(`Montant du : ${fmt(invoice.remaining || invoice.total_ttc)}`, marginL + 4, y + 14)
  }

  y += 30

  // ========== MENTION LEGALE ==========
  drawHLine()
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(120, 120, 120)
  const legalText =
    invoice.status === 'paid'
      ? `Je soussigne(e), ${structure?.name || '-'}, proprietaire du logement designe ci-dessus, declare avoir recu de ${tenantName} la somme de ${fmt(invoice.total_ttc)} au titre du paiement du loyer et des charges pour la periode indiquee et lui en donne quittance, sous reserve de tous mes droits.`
      : `Le present document constitue un appel de loyer. La quittance definitive sera emise apres encaissement integral du montant du.`
  const splitText = doc.splitTextToSize(legalText, contentW)
  doc.text(splitText, marginL, y)
  y += splitText.length * 4 + 8

  // Signature
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  const today = new Date().toLocaleDateString('fr-FR')
  doc.text(`Fait a ${structure?.city || property?.city || '-'}, le ${today}`, pageW - marginR - 4, y, { align: 'right' })
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text(structure?.name || '-', pageW - marginR - 4, y, { align: 'right' })

  // ========== FOOTER ==========
  const footerY = doc.internal.pageSize.getHeight() - 10
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150, 150, 150)
  doc.text('Document genere automatiquement - GestionLoc', pageW / 2, footerY, { align: 'center' })

  // ========== DOWNLOAD ==========
  const filename = `Quittance_${invoice.period_label?.replace(/\s/g, '_') || invoice.id}_${(tenant?.last_name || 'locataire').replace(/\s/g, '_')}.pdf`
  doc.save(filename)
}

/**
 * Generate PDF as Blob for preview in browser
 */
export function generateQuittancePDFBlob(params) {
  const { invoice, tenant, property, structure, lease } = params
  const jsPDF = require('jspdf').default || require('jspdf')
  // We'd need to duplicate the logic or refactor - for now just use download
  generateQuittancePDF(params)
  return null
}
