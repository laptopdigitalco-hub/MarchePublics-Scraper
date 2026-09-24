export interface NaturePrestationOption {
  value: string;
  label: string;
  category: 'Travaux' | 'Fournitures' | 'Services';
}

export const PROCUREMENT_CATEGORIES = [
  { value: '', label: 'Toutes les catégories' },
  { value: '1', label: 'Travaux' },
  { value: '2', label: 'Fournitures' },
  { value: '3', label: 'Services' },
];

export const POPULAR_LOCATIONS = [
  'RABAT',
  'CASABLANCA',
  'TANGER',
  'MARRAKECH',
  'FES',
  'AGADIR',
  'AL HOCEIMA',
  'OUJDA',
  'KENITRA',
  'TETOUAN',
  'MEKNES',
  'BENI MELLAL'
];

export const POPULAR_BUYERS = [
  { label: 'Santé & CHU', value: 'sante' },
  { label: 'Éducation & AREF', value: 'education' },
  { label: 'Communes', value: 'commune' },
  { label: 'Provinces & Préfectures', value: 'province' },
  { label: 'Intérieur', value: 'interieur' },
  { label: 'Équipement & Eau', value: 'equipement' },
  { label: 'ONDA (Aéroports)', value: 'onda' },
  { label: 'ONCF (Chemins de fer)', value: 'oncf' },
];

export const NATURE_PRESTATIONS: NaturePrestationOption[] = [
  { value: '', label: 'Toutes les natures de prestation', category: 'Fournitures' },
  { value: '1', label: 'Travaux d’aménagement des espaces verts', category: 'Travaux' },
  { value: '3', label: 'Travaux d’aménagement, d’entretien et réparation des bâtiments administratifs', category: 'Travaux' },
  { value: '5', label: 'Travaux d’aménagement, d’entretien des ouvrages, voies et réseaux', category: 'Travaux' },
  { value: '6', label: 'Travaux d’équipement et renforcement des postes MT/BT d’électricité', category: 'Travaux' },
  { value: '7', label: 'Travaux d’installation de matériels divers', category: 'Travaux' },
  { value: '8', label: 'Travaux de branchement et extension eau potable et électricité', category: 'Travaux' },
  { value: '13', label: 'Achat d’articles de droguerie, quincaillerie et menuiserie', category: 'Fournitures' },
  { value: '16', label: 'Achat de carburants et lubrifiants', category: 'Fournitures' },
  { value: '19', label: 'Achat de fournitures de bureau et documentation', category: 'Fournitures' },
  { value: '20', label: 'Achat de matériaux de construction', category: 'Fournitures' },
  { value: '25', label: 'Achat de matériel de sécurité et lutte contre l’incendie', category: 'Fournitures' },
  { value: '29', label: 'Achat de matériel et mobilier de bureau', category: 'Fournitures' },
  { value: '30', label: 'Achat de matériel technique, logiciels et matériel informatique', category: 'Fournitures' },
  { value: '50', label: 'Fourniture d’équipements médico-techniques et pièces de rechange', category: 'Fournitures' },
  { value: '52', label: 'Fourniture de films et de produits radiologiques', category: 'Fournitures' },
  { value: '53', label: 'Fourniture de fongibles médicaux et de fils chirurgicaux', category: 'Fournitures' },
  { value: '60', label: 'Fournitures et produits d’entretien et de nettoyage', category: 'Fournitures' },
  { value: '68', label: 'Entretien et maintenance de logiciels et progiciels', category: 'Services' },
  { value: '69', label: 'Entretien et maintenance des équipements informatique', category: 'Services' },
  { value: '72', label: 'Études, conseil et formation', category: 'Services' },
  { value: '80', label: 'Prestation de jardinage, de gardiennage et de nettoyage', category: 'Services' },
  { value: '82', label: 'Prestations d’entretien des véhicules et engins', category: 'Services' },
  { value: '95', label: 'Prestations d’hôtellerie, d’hébergement et de restauration', category: 'Services' },
  { value: '97', label: 'Prestations médicales, hospitalières et de brancardage', category: 'Services' },
];
