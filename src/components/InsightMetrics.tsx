import React from 'react';
import { Database, Coins, Clock, Building2, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import { TenderItem } from '../types';
import { isTenderExpired, getTenderHoursRemaining } from '../utils/chartFilters';

interface InsightMetricsProps {
  tenders: TenderItem[];
  totalFoundOnPortal: number;
}

export const InsightMetrics: React.FC<InsightMetricsProps> = ({ tenders, totalFoundOnPortal }) => {
  // Calculations
  const totalCount = tenders.length;
  
  // Budget stats
  const totalBudget = tenders.reduce((acc, t) => acc + (t.budgetEstime || 0), 0);
  const avgBudget = totalCount > 0 ? Math.round(totalBudget / totalCount) : 0;
  
  // Format MAD with Millions/K or standard
  const formatMAD = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)} M MAD`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(0)} k MAD`;
    }
    return `${num.toLocaleString('fr-FR')} MAD`;
  };

  // Urgent active tenders (less than 7 days remaining, not expired)
  const urgentCount = tenders.filter(t => {
    if (isTenderExpired(t)) return false;
    const h = getTenderHoursRemaining(t);
    return h > 0 && h <= 168;
  }).length;

  // Distinct buyers
  const uniqueBuyers = new Set(tenders.map(t => t.acheteur).filter(Boolean)).size;

  // Category counts
  const travauxCount = tenders.filter(t => t.categorie === 'Travaux').length;
  const fournituresCount = tenders.filter(t => t.categorie === 'Fournitures').length;
  const servicesCount = tenders.filter(t => t.categorie === 'Services').length;

  const getPercentage = (count: number) => {
    if (totalCount === 0) return 0;
    return Math.round((count / totalCount) * 100);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Metric 1: Total Consultations */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Avis Extraits
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {totalCount.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-700 font-semibold">
              {totalFoundOnPortal.toLocaleString()}
            </span>
            <span>total trouvés sur le portail</span>
          </div>
        </div>
      </div>

      {/* Metric 2: Estimated Budget Volume */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-teal-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Volume Budgétaire Estimé
          </span>
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 tracking-tight text-teal-800">
            {formatMAD(totalBudget)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Moyenne : <strong className="text-slate-700">{formatMAD(avgBudget)}</strong> / avis
          </div>
        </div>
      </div>

      {/* Metric 3: Urgent Deadlines */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Délais Urgents (&lt; 7 jours)
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-amber-700 tracking-tight">
            {urgentCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Plis à remettre dans les 7 prochains jours
          </div>
        </div>
      </div>

      {/* Metric 4: Acheteurs Publics */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-cyan-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Acheteurs Distincts
          </span>
          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {uniqueBuyers}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Ministères, CHU, Communes, Provinces
          </div>
        </div>
      </div>

      {/* Category breakdown bar */}
      <div className="sm:col-span-2 lg:col-span-4 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          <div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Répartition par Type de Marché (Procurement Category)
            </span>
            <span className="text-xs text-slate-400">
              Distribution des avis d'achats analysés
            </span>
          </div>
        </div>

        {/* Breakdown Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-xs font-medium text-slate-300">Travaux :</span>
            <strong className="text-xs text-white">{travauxCount} ({getPercentage(travauxCount)}%)</strong>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-xs font-medium text-slate-300">Fournitures :</span>
            <strong className="text-xs text-white">{fournituresCount} ({getPercentage(fournituresCount)}%)</strong>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span className="text-xs font-medium text-slate-300">Services :</span>
            <strong className="text-xs text-white">{servicesCount} ({getPercentage(servicesCount)}%)</strong>
          </div>
        </div>
      </div>

    </div>
  );
};
