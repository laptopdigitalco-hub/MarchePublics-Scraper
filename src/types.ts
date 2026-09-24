export type ProcurementCategory = 'Travaux' | 'Fournitures' | 'Services' | 'Autre';

export type TenderStatus = 'En cours' | 'Annulé' | 'Attribué' | 'Infructueux' | 'Clôturé';

export interface TenderArticle {
  index: number;
  title: string;
  specification?: string;
  unit?: string;
  quantity?: number;
  tva?: number;
  unitPrice?: number;
  totalTTC?: number;
  guarantee?: string;
}

export interface TenderAttachment {
  name: string;
  url: string;
}

export interface TenderItem {
  id: string;
  reference: string;
  objet: string;
  acheteur: string;
  datePublication: string;
  dateLimite: string;
  dateLimiteRaw: string;
  timeRemainingHours?: number;
  lieuExecution: string;
  status: TenderStatus;
  categorie: ProcurementCategory;
  naturePrestation: string;
  budgetEstime: number; // in MAD (Moroccan Dirham)
  budgetEstimeFormatted: string;
  budgetType: 'explicit' | 'calculated' | 'bdc_ceiling' | 'unspecified';
  articlesCount: number;
  articles?: TenderArticle[];
  piecesJointes?: TenderAttachment[];
  sourceUrl: string;
  crawledAt: string;
  pageNumber: number;
}

export interface ScraperSearchParams {
  keyword: string;
  reference: string;
  objet: string;
  buyer: string;
  service: string;
  location: string;
  categorie: string; // '', '1' (Travaux), '2' (Fournitures), '3' (Services)
  naturePrestation: string;
  dateLimiteStart: string;
  dateLimiteEnd: string;
  dateMiseEnLigneStart: string;
  dateMiseEnLigneEnd: string;
  pageSize: number; // 10, 20, 30, 50
  maxPages: number; // 1 to 10
  deepScraping: boolean; // fetch detail pages for each tender
  delayMs: number; // delay between requests (anti-detection polite crawling)
}

export interface ScraperLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  url?: string;
  page?: number;
}

export interface ScraperProgress {
  status: 'idle' | 'running' | 'completed' | 'cancelled' | 'error';
  currentPage: number;
  totalPages: number;
  totalResultsAvailable: number;
  itemsScraped: number;
  detailPagesScraped: number;
  currentAction: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface ScrapeResponse {
  success: boolean;
  totalFound: number;
  pagesScraped: number;
  tenders: TenderItem[];
  logs: ScraperLog[];
  durationMs: number;
  error?: string;
}

export interface ChartFilter {
  type: 'urgency' | 'category' | 'buyer' | 'location' | 'region' | 'budget';
  label: string;
  value: string;
}
