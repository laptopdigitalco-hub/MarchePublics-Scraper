import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  Eye,
  Download,
  Copy,
  Check,
  ArrowUpDown,
  Filter,
  MapPin,
  Clock,
  Building,
  Coins,
  FileSpreadsheet
} from 'lucide-react';
import { TenderItem, ProcurementCategory, TenderStatus, ChartFilter } from '../types';
import { getEffectiveTenderStatus, isTenderExpired } from '../utils/chartFilters';

interface TenderTableProps {
  tenders: TenderItem[];
  onSelectTender: (tender: TenderItem) => void;
  activeChartFilter?: ChartFilter | null;
  onClearChartFilter?: () => void;
}

export const TenderTable: React.FC<TenderTableProps> = ({
  tenders,
  onSelectTender,
  activeChartFilter,
  onClearChartFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof TenderItem>('datePublication');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [copied, setCopied] = useState(false);

  // Reset page when filter or tenders change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeChartFilter, tenders]);

  // Filtered & Sorted tenders
  const filteredTenders = useMemo(() => {
    return tenders.filter((t) => {
      // Text search
      const q = searchQuery.toLowerCase().trim();
      const matchText =
        !q ||
        t.reference.toLowerCase().includes(q) ||
        t.objet.toLowerCase().includes(q) ||
        t.acheteur.toLowerCase().includes(q) ||
        t.lieuExecution.toLowerCase().includes(q) ||
        t.naturePrestation.toLowerCase().includes(q);

      // Category filter
      const matchCat =
        selectedCategory === 'all' ||
        t.categorie.toLowerCase() === selectedCategory.toLowerCase();

      // Status filter with automated deadline verification
      const effectiveStatus = getEffectiveTenderStatus(t);
      const matchStatus =
        selectedStatus === 'all' ||
        effectiveStatus.toLowerCase() === selectedStatus.toLowerCase();

      return matchText && matchCat && matchStatus;
    }).sort((a, b) => {
      let valA: any = sortField === 'status' ? getEffectiveTenderStatus(a) : a[sortField];
      let valB: any = sortField === 'status' ? getEffectiveTenderStatus(b) : b[sortField];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [tenders, searchQuery, selectedCategory, selectedStatus, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTenders.length / pageSize));
  const paginatedTenders = filteredTenders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof TenderItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const exportCSV = () => {
    if (filteredTenders.length === 0) return;
    const headers = ['ID', 'Référence', 'Objet', 'Acheteur', 'Lieu', 'Catégorie', 'Nature Prestation', 'Budget Estimé (MAD)', 'Date Limite', 'Statut', 'Lien'];
    const rows = filteredTenders.map(t => [
      `"${t.id}"`,
      `"${t.reference.replace(/"/g, '""')}"`,
      `"${t.objet.replace(/"/g, '""')}"`,
      `"${t.acheteur.replace(/"/g, '""')}"`,
      `"${t.lieuExecution.replace(/"/g, '""')}"`,
      `"${t.categorie}"`,
      `"${t.naturePrestation.replace(/"/g, '""')}"`,
      t.budgetEstime,
      `"${t.dateLimite}"`,
      `"${getEffectiveTenderStatus(t)}"`,
      `"${t.sourceUrl}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `marchespublics_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dataWithStatus = filteredTenders.map(t => ({
      ...t,
      status: getEffectiveTenderStatus(t)
    }));
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataWithStatus, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `marchespublics_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copySummary = () => {
    const text = filteredTenders.map(t => `${t.reference} | ${t.acheteur} | ${t.categorie} | [${getEffectiveTenderStatus(t)}] | ${t.budgetEstimeFormatted} | ${t.objet.slice(0, 80)}... | Limite: ${t.dateLimite}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: TenderStatus) => {
    switch (status) {
      case 'Annulé':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Annulé</span>;
      case 'Attribué':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Attribué</span>;
      case 'Infructueux':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">Infructueux</span>;
      case 'Clôturé':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300" title="Délai de remise des offres expiré">Clôturé</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">En cours</span>;
    }
  };

  const getCategoryBadge = (cat: ProcurementCategory) => {
    switch (cat) {
      case 'Travaux':
        return <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">Travaux</span>;
      case 'Fournitures':
        return <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-cyan-50 text-cyan-800 border border-cyan-200">Fournitures</span>;
      case 'Services':
        return <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200">Services</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Autre</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Active Chart Filter Banner if present */}
      {activeChartFilter && (
        <div className="bg-emerald-50/90 border-b border-emerald-200 px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-950">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-semibold text-slate-900">Filtré par le graphique :</span>
            <span className="bg-white font-bold px-2 py-0.5 rounded-md border border-emerald-300 text-emerald-800 shadow-2xs">
              {activeChartFilter.label}
            </span>
            <span className="text-emerald-700">({tenders.length} offre{tenders.length > 1 ? 's' : ''} correspondante{tenders.length > 1 ? 's' : ''})</span>
          </div>
          {onClearChartFilter && (
            <button
              onClick={onClearChartFilter}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline hover:no-underline cursor-pointer"
            >
              ✕ Réinitialiser le filtre du graphique
            </button>
          )}
        </div>
      )}

      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search bar inside table */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Filtrer dans les avis extraits (référence, mot clé, acheteur, ville)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Filters & Export Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Toutes Catégories</option>
            <option value="travaux">Travaux</option>
            <option value="fournitures">Fournitures</option>
            <option value="services">Services</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Tous Statuts</option>
            <option value="en cours">En cours (Actifs)</option>
            <option value="clôturé">Clôturé (Délai expiré)</option>
            <option value="annulé">Annulé</option>
            <option value="attribué">Attribué</option>
            <option value="infructueux">Infructueux</option>
          </select>

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition shadow-sm"
            title="Exporter vers Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>

          {/* Export JSON */}
          <button
            onClick={exportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Exporter en JSON"
          >
            <Download className="w-3.5 h-3.5" />
            JSON
          </button>

          {/* Copy Summary */}
          <button
            onClick={copySummary}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            title="Copier le résumé"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
              <th className="py-3 px-4 cursor-pointer hover:text-emerald-700 select-none" onClick={() => handleSort('reference')}>
                <div className="flex items-center gap-1">
                  <span>Réf / Avis</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 min-w-[280px]">Objet de la Consultation</th>
              <th className="py-3 px-4 cursor-pointer hover:text-emerald-700 select-none min-w-[180px]" onClick={() => handleSort('acheteur')}>
                <div className="flex items-center gap-1">
                  <span>Acheteur Public</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-emerald-700 select-none" onClick={() => handleSort('lieuExecution')}>
                <div className="flex items-center gap-1">
                  <span>Lieu</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-emerald-700 select-none" onClick={() => handleSort('categorie')}>
                <div className="flex items-center gap-1">
                  <span>Type</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-emerald-700 select-none text-right" onClick={() => handleSort('budgetEstime')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Budget Estimé</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-emerald-700 select-none" onClick={() => handleSort('dateLimite')}>
                <div className="flex items-center gap-1">
                  <span>Date Limite</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedTenders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="max-w-md mx-auto space-y-2">
                    <p className="font-semibold text-slate-700">
                      {tenders.length === 0 ? 'Aucune consultation en mémoire (0 avis)' : 'Aucun avis ne correspond aux filtres actuels'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {tenders.length === 0
                        ? 'Définissez vos critères de recherche ci-dessus et cliquez sur « Lancer le Scraper ».'
                        : "Essayez d'élargir vos termes de recherche ou de réinitialiser les filtres."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTenders.map((tender) => {
                const effStatus = getEffectiveTenderStatus(tender);
                const isExp = isTenderExpired(tender);
                return (
                  <tr
                    key={tender.id}
                    className="hover:bg-emerald-50/30 transition group cursor-pointer"
                    onClick={() => onSelectTender(tender)}
                  >
                    {/* Reference & Status */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        {tender.reference}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        {getStatusBadge(effStatus)}
                        <span className="text-[10px] text-slate-400">#{tender.id}</span>
                      </div>
                    </td>

                    {/* Objet */}
                    <td className="py-3.5 px-4">
                      <div className="line-clamp-2 font-medium text-slate-800 leading-snug" title={tender.objet}>
                        {tender.objet}
                      </div>
                      {tender.naturePrestation && tender.naturePrestation !== 'En attente d’extraction détaillée...' && (
                        <div className="text-[11px] text-slate-500 mt-1 truncate" title={tender.naturePrestation}>
                          ↳ {tender.naturePrestation}
                        </div>
                      )}
                    </td>

                    {/* Acheteur */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-tight">{tender.acheteur}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{tender.lieuExecution}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getCategoryBadge(tender.categorie)}
                    </td>

                    {/* Estimated Budget */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {tender.budgetEstimeFormatted}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {tender.budgetType === 'explicit' ? 'Précisé' : tender.budgetType === 'bdc_ceiling' ? 'Seuil légal' : 'Selon devis'}
                      </span>
                    </td>

                    {/* Date Limite */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {tender.dateLimite}
                      </div>
                      {isExp ? (
                        <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                          Délai expiré
                        </span>
                      ) : tender.timeRemainingHours !== undefined && tender.timeRemainingHours > 0 ? (
                        <span className={`text-[10px] font-medium block mt-0.5 ${
                          tender.timeRemainingHours <= 72 ? 'text-rose-600 font-bold' : tender.timeRemainingHours <= 168 ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {tender.timeRemainingHours <= 72 ? `⚠️ Reste ${Math.round(tender.timeRemainingHours / 24)}j` : `Dans ${Math.round(tender.timeRemainingHours / 24)} jours`}
                        </span>
                      ) : null}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectTender(tender)}
                          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition"
                          title="Consulter les détails complets (Articles, Devis, Pièces)"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={tender.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Ouvrir sur le portail officiel marchespublics.gov.ma"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          Affichage de <strong className="text-slate-800">{filteredTenders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> à <strong className="text-slate-800">{Math.min(currentPage * pageSize, filteredTenders.length)}</strong> sur <strong className="text-slate-800">{filteredTenders.length}</strong> avis extraits
        </div>

        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
          >
            <option value={10}>10 / page</option>
            <option value={15}>15 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>

          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Précédent
          </button>
          <span className="px-2 font-medium">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Suivant
          </button>
        </div>
      </div>

    </div>
  );
};
