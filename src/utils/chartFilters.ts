import { TenderItem, TenderStatus, ChartFilter } from '../types';

export function isTenderExpired(t: { dateLimite?: string; dateLimiteRaw?: string }): boolean {
  const raw = t.dateLimiteRaw || t.dateLimite || '';
  if (!raw) return false;
  const match = raw.match(/(\d{2})[/-](\d{2})[/-](\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const year = parseInt(match[3], 10);
  const hour = match[4] ? parseInt(match[4], 10) : 23;
  const minute = match[5] ? parseInt(match[5], 10) : 59;

  const targetDate = new Date(year, month, day, hour, minute);
  return targetDate.getTime() < Date.now();
}

export function getEffectiveTenderStatus(t: TenderItem): TenderStatus {
  // Formal terminal statuses declared by the portal or authority
  if (t.status === 'Annulé' || t.status === 'Attribué' || t.status === 'Infructueux') {
    return t.status;
  }
  // If explicitly Clôturé or if the deadline date/hour has expired
  if (t.status === 'Clôturé' || isTenderExpired(t)) {
    return 'Clôturé';
  }
  return 'En cours';
}

export function getTenderHoursRemaining(t: TenderItem): number {
  const raw = t.dateLimiteRaw || t.dateLimite || '';
  if (raw) {
    const match = raw.match(/(\d{2})[/-](\d{2})[/-](\d{4})(?:\s+(\d{2}):(\d{2}))?/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      const hour = match[4] ? parseInt(match[4], 10) : 12;
      const minute = match[5] ? parseInt(match[5], 10) : 0;
      const diffMs = new Date(year, month, day, hour, minute).getTime() - Date.now();
      return Math.round(diffMs / (1000 * 60 * 60));
    }
  }

  if (typeof t.timeRemainingHours === 'number' && !isNaN(t.timeRemainingHours)) {
    return t.timeRemainingHours;
  }
  return 0;
}

export function getTenderUrgencyBucket(t: TenderItem): string {
  const h = getTenderHoursRemaining(t);
  if (h <= 0 || isTenderExpired(t)) return 'Clôturé/Passé';
  if (h <= 72) return '< 3 jours';
  if (h <= 168) return '3 - 7 jours';
  if (h <= 336) return '7 - 14 jours';
  return '> 14 jours';
}

export function getTenderBudgetBucket(t: TenderItem): string {
  if (t.budgetType === 'bdc_ceiling') return 'Plafond BDC';
  const b = t.budgetEstime || 0;
  if (b <= 0) return 'Plafond BDC';
  if (b < 100000) return '< 100k MAD';
  if (b <= 250000) return '100k - 250k';
  if (b <= 500000) return '250k - 500k';
  return '> 500k MAD';
}

export function getTenderRegion(t: TenderItem): string {
  const loc = ((t.lieuExecution || '') + ' ' + (t.acheteur || '')).toUpperCase();
  
  if (/CASABLANCA|NOUACEUR|MEDIOUNA|MOHAMMEDIA|SETTAT|BERRECHID|JADIDA|SIDI BENNOUR|BENSLIMANE|BOUZNIKA/.test(loc)) {
    return 'Casablanca-Settat';
  }
  if (/RABAT|SALE|KENITRA|TEMARA|SKHIRAT|KHEMISSET|TIFLET|SIDI KACEM|SIDI SLIMANE/.test(loc)) {
    return 'Rabat-Salé-Kénitra';
  }
  if (/MARRAKECH|SAFI|ESSAOUIRA|KELAA|SRAGHNA|CHICHAOUA|HAOUZ|REHAMNA|BENGUERIR|YOUSSOUFIA/.test(loc)) {
    return 'Marrakech-Safi';
  }
  if (/TANGER|TETOUAN|HOCEIMA|LARACHE|KSAR EL KEBIR|CHEFCHAOUEN|OUEZZANE|M'DIQ|FNIDEQ|FAHS|ASILAH/.test(loc)) {
    return 'Tanger-Tétouan-Al Hoceïma';
  }
  if (/FES|FEZ|MEKNES|TAZA|SEFROU|IFRANE|AZROU|EL HAJEB|BOULEMANE|TAOUNATE|MOULAY YACOUB/.test(loc)) {
    return 'Fès-Meknès';
  }
  if (/AGADIR|INEZGANE|AIT MELLOUL|CHTOUKA|AIT BAHA|TAROUDANT|TIZNIT|TATA|BIOUGRA/.test(loc)) {
    return 'Souss-Massa';
  }
  if (/BENI MELLAL|KHENIFRA|FQUIH BEN SALAH|FKIH BEN SALAH|KHOURIBGA|OUED ZEM|AZILAL|DEMNATE/.test(loc)) {
    return 'Béni Mellal-Khénifra';
  }
  if (/OUJDA|NADOR|BERKANE|TAOURIRT|JERADA|FIGUIG|BOUARFA|DRIOUCH|GUERCIF/.test(loc)) {
    return "L'Oriental";
  }
  if (/ERRACHIDIA|OUARZAZATE|ZAGORA|TINGHIR|MIDELT|ERFOUD|RISSANI/.test(loc)) {
    return 'Drâa-Tafilalet';
  }
  if (/GUELMIM|TAN-TAN|TAN TAN|SIDI IFNI|ASSA|ZAG/.test(loc)) {
    return 'Guelmim-Oued Noun';
  }
  if (/LAAYOUNE|LAÂYOUNE|BOUJDOUR|TARFAYA|SMARA|SEMARA/.test(loc)) {
    return 'Laâyoune-Sakia El Hamra';
  }
  if (/DAKHLA|OUED ED-DAHAB|AOUSSERD/.test(loc)) {
    return 'Dakhla-Oued Ed-Dahab';
  }
  
  return 'National / Autre';
}

export function filterTendersByChart(tenders: TenderItem[], filter: ChartFilter | null): TenderItem[] {
  if (!filter) return tenders;

  switch (filter.type) {
    case 'urgency': {
      return tenders.filter((t) => getTenderUrgencyBucket(t) === filter.value);
    }

    case 'category': {
      return tenders.filter((t) => {
        if (filter.value === 'Autre') {
          return !['Travaux', 'Fournitures', 'Services'].includes(t.categorie);
        }
        return (t.categorie || '').toLowerCase() === filter.value.toLowerCase();
      });
    }

    case 'buyer': {
      const q = filter.value.toLowerCase().trim();
      return tenders.filter((t) => {
        const b = (t.acheteur || '').toLowerCase().trim();
        return b.includes(q) || q.includes(b);
      });
    }

    case 'location': {
      const q = filter.value.toUpperCase().trim();
      return tenders.filter((t) => {
        const loc = (t.lieuExecution || 'Non spécifié').toUpperCase().trim();
        return loc.includes(q) || q.includes(loc);
      });
    }

    case 'region': {
      return tenders.filter((t) => getTenderRegion(t) === filter.value);
    }

    case 'budget': {
      return tenders.filter((t) => getTenderBudgetBucket(t) === filter.value);
    }

    default:
      return tenders;
  }
}

