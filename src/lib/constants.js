export const STRUCTURE_TYPES = {
  sci_ir: { label: 'SCI a l\'IR', description: 'Societe Civile Immobiliere a l\'Impot sur le Revenu' },
  sci_is: { label: 'SCI a l\'IS', description: 'Societe Civile Immobiliere a l\'Impot sur les Societes' },
  nom_propre: { label: 'Nom Propre', description: 'Detenu en nom propre (personne physique)' },
}

export const PROPERTY_TYPES = {
  appartement: { label: 'Appartement', icon: 'HiOutlineBuildingOffice' },
  maison: { label: 'Maison', icon: 'HiOutlineHome' },
  local_commercial: { label: 'Local Commercial', icon: 'HiOutlineBuildingStorefront' },
  parking: { label: 'Parking', icon: 'HiOutlineTruck' },
  cave: { label: 'Cave', icon: 'HiOutlineArchiveBox' },
}

export const PROPERTY_STATUSES = {
  vacant: { label: 'Vacant', color: 'warning' },
  occupied: { label: 'Occupe', color: 'success' },
  renovation: { label: 'En travaux', color: 'danger' },
}

export const LEASE_TYPES = {
  habitation_vide: { label: 'Habitation Vide', duration: 36, notice: 3, deposit: 1 },
  habitation_meuble: { label: 'Habitation Meublee', duration: 12, notice: 1, deposit: 2 },
  commercial_369: { label: 'Commercial 3/6/9', duration: 108, notice: 6, deposit: 3 },
  professionnel: { label: 'Professionnel', duration: 72, notice: 6, deposit: 2 },
}

export const TVA_RATES = [
  { value: 0, label: 'Exonere (0%)' },
  { value: 5.5, label: 'Reduit (5,5%)' },
  { value: 10, label: 'Intermediaire (10%)' },
  { value: 20, label: 'Normal (20%)' },
]

export const TVA_REGIMES = {
  franchise: 'Franchise en base de TVA',
  reel_simplifie: 'Reel simplifie',
  reel_normal: 'Reel normal',
  micro: 'Micro-entreprise',
}

export const PAYMENT_METHODS = {
  virement: 'Virement bancaire',
  cheque: 'Cheque',
  especes: 'Especes',
  prelevement: 'Prelevement automatique',
}

export const INVOICE_STATUSES = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  partially_paid: { label: 'Partiellement paye', color: 'bg-orange-100 text-orange-800' },
  paid: { label: 'Paye', color: 'bg-green-100 text-green-800' },
  overdue: { label: 'Impaye', color: 'bg-red-100 text-red-800' },
}

export const CHARGES_TYPES = {
  provision: 'Provision sur charges (avec regularisation)',
  forfait: 'Forfait de charges (sans regularisation)',
}
