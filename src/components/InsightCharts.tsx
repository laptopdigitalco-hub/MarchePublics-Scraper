import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart3,
  MapPin,
  Compass,
  CalendarClock,
  Coins,
  Filter,
  X,
  MousePointerClick
} from 'lucide-react';
import { TenderItem, ChartFilter } from '../types';
import { getTenderUrgencyBucket, getTenderBudgetBucket, getTenderRegion } from '../utils/chartFilters';

interface InsightChartsProps {
  tenders: TenderItem[];
  activeFilter?: ChartFilter | null;
  onSelectFilter?: (filter: ChartFilter | null) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Travaux: '#f59e0b', // amber
  Fournitures: '#06b6d4', // cyan
  Services: '#8b5cf6', // purple
  Autre: '#64748b' // slate
};

const BUYER_COLORS = [
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
];

const LOCATION_COLORS = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
];

const REGION_COLORS = [
  '#0d9488', // teal
  '#0284c7', // light blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f97316', // orange
  '#14b8a6', // teal-light
  '#84cc16', // lime
  '#64748b'  // slate
];

export const InsightCharts: React.FC<InsightChartsProps> = ({
  tenders,
  activeFilter,
  onSelectFilter
}) => {
  // 1. Category Distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = { Travaux: 0, Fournitures: 0, Services: 0 };
    tenders.forEach((t) => {
      const cat = t.categorie || 'Autre';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || '#64748b'
      }));
  }, [tenders]);

  // 2. Top Buyers Data
  const topBuyersData = useMemo(() => {
    const map: Record<string, { count: number; totalBudget: number }> = {};
    tenders.forEach((t) => {
      const buyer = t.acheteur || 'Acheteur non spécifié';
      if (!map[buyer]) {
        map[buyer] = { count: 0, totalBudget: 0 };
      }
      map[buyer].count += 1;
      map[buyer].totalBudget += t.budgetEstime || 0;
    });

    return Object.entries(map)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6)
      .map(([buyer, stats]) => ({
        buyer: buyer.length > 26 ? buyer.substring(0, 24) + '...' : buyer,
        fullBuyer: buyer,
        count: stats.count,
        budget: Math.round(stats.totalBudget / 1000) // in k MAD
      }));
  }, [tenders]);

  // 3. Location Distribution
  const locationData = useMemo(() => {
    const locMap: Record<string, number> = {};
    tenders.forEach((t) => {
      const loc = (t.lieuExecution || 'Non spécifié').toUpperCase().trim();
      locMap[loc] = (locMap[loc] || 0) + 1;
    });

    return Object.entries(locMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([fullLocation, count]) => ({
        location: fullLocation.length > 16 ? fullLocation.substring(0, 14) + '...' : fullLocation,
        fullLocation,
        count
      }));
  }, [tenders]);

  // 4. Urgency Deadline Timeline Buckets (Unified via getTenderUrgencyBucket)
  const deadlineUrgencyData = useMemo(() => {
    const counts: Record<string, number> = {
      '< 3 jours': 0,
      '3 - 7 jours': 0,
      '7 - 14 jours': 0,
      '> 14 jours': 0,
      'Clôturé/Passé': 0
    };

    tenders.forEach((t) => {
      const b = getTenderUrgencyBucket(t);
      if (counts[b] !== undefined) {
        counts[b]++;
      }
    });

    return [
      { name: '< 3 jours', avis: counts['< 3 jours'], fill: '#ef4444' },
      { name: '3 - 7 jours', avis: counts['3 - 7 jours'], fill: '#f59e0b' },
      { name: '7 - 14 jours', avis: counts['7 - 14 jours'], fill: '#06b6d4' },
      { name: '> 14 jours', avis: counts['> 14 jours'], fill: '#10b981' },
      { name: 'Clôturé/Passé', avis: counts['Clôturé/Passé'], fill: '#94a3b8' }
    ];
  }, [tenders]);

  // 5. Budget Range Buckets (Unified via getTenderBudgetBucket)
  const budgetRangeData = useMemo(() => {
    const counts: Record<string, number> = {
      '< 100k MAD': 0,
      '100k - 250k': 0,
      '250k - 500k': 0,
      '> 500k MAD': 0,
      'Plafond BDC': 0
    };

    tenders.forEach((t) => {
      const b = getTenderBudgetBucket(t);
      if (counts[b] !== undefined) {
        counts[b]++;
      }
    });

    return [
      { range: '< 100k MAD', avis: counts['< 100k MAD'], fill: '#10b981' },
      { range: '100k - 250k', avis: counts['100k - 250k'], fill: '#06b6d4' },
      { range: '250k - 500k', avis: counts['250k - 500k'], fill: '#3b82f6' },
      { range: '> 500k MAD', avis: counts['> 500k MAD'], fill: '#8b5cf6' },
      { range: 'Plafond BDC', avis: counts['Plafond BDC'], fill: '#f59e0b' }
    ];
  }, [tenders]);

  // 6. Regional Distribution (12 Régions Administratives du Maroc)
  const regionData = useMemo(() => {
    const regMap: Record<string, number> = {};
    tenders.forEach((t) => {
      const reg = getTenderRegion(t);
      regMap[reg] = (regMap[reg] || 0) + 1;
    });

    return Object.entries(regMap)
      .sort((a, b) => b[1] - a[1])
      .map(([fullRegion, count]) => ({
        region: fullRegion.length > 18 ? fullRegion.substring(0, 16) + '...' : fullRegion,
        fullRegion,
        count
      }));
  }, [tenders]);

  const toggleFilter = (filter: ChartFilter) => {
    if (activeFilter?.type === filter.type && activeFilter?.value === filter.value) {
      onSelectFilter?.(null);
    } else {
      onSelectFilter?.(filter);
    }
  };

  if (tenders.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 shadow-sm">
        <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="font-semibold text-slate-800 text-sm">Aucune donnée analytique pour l'instant</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Lancez une extraction avec le scraper ci-dessus pour générer les graphiques décisionnels interactifs (catégories, acheteurs, budgets, délais).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Interactive Helper Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <MousePointerClick className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span className="font-semibold text-slate-900">Interactivité Graphique :</span>
          <span>Cliquez sur une barre, une tranche ou une étiquette pour filtrer instantanément la liste des offres.</span>
        </div>

        {activeFilter ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-300">
              <Filter className="w-3.5 h-3.5 text-emerald-700" />
              {activeFilter.label}
            </span>
            <button
              onClick={() => onSelectFilter?.(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition font-medium cursor-pointer"
              title="Désactiver le filtre graphique"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
              Tout afficher
            </button>
          </div>
        ) : (
          <span className="text-slate-500 italic">Aucun filtre graphique actif (toutes les offres sont affichées)</span>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Categories Breakdown Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                Répartition par Catégorie de Marché
              </h3>
              <p className="text-xs text-slate-500">
                Cliquez sur une catégorie pour isoler ses avis d'achat
              </p>
            </div>
            {activeFilter?.type === 'category' && (
              <button
                onClick={() => onSelectFilter?.(null)}
                className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" /> Réinitialiser
              </button>
            )}
          </div>

          <div className="h-64 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 10, right: 10, left: -15, bottom: 10 }}
                onClick={(state: any) => {
                  const data = state?.activePayload?.[0]?.payload ||
                    (state?.activeTooltipIndex !== undefined ? categoryData[state.activeTooltipIndex] : null);
                  if (data && data.name) {
                    toggleFilter({
                      type: 'category',
                      label: `Catégorie : ${data.name}`,
                      value: data.name
                    });
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} avis (cliquez pour filtrer)`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                  onClick={(entry: any) => {
                    const name = entry?.name || entry?.payload?.name;
                    if (name) {
                      toggleFilter({
                        type: 'category',
                        label: `Catégorie : ${name}`,
                        value: name
                      });
                    }
                  }}
                >
                  {categoryData.map((entry, index) => {
                    const isSelected = activeFilter?.type === 'category' && activeFilter.value === entry.name;
                    const isOther = activeFilter?.type === 'category' && !isSelected;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={isOther ? 0.35 : 1}
                        stroke={isSelected ? '#0f172a' : '#ffffff'}
                        strokeWidth={isSelected ? 3 : 1}
                        className="cursor-pointer transition-all duration-200 hover:opacity-85"
                        onClick={() => {
                          toggleFilter({
                            type: 'category',
                            label: `Catégorie : ${entry.name}`,
                            value: entry.name
                          });
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Clickable Legend Pills */}
          <div className="flex items-center justify-center gap-2 mt-2 pt-3 border-t border-slate-100 flex-wrap">
            {categoryData.map((c) => {
              const isSelected = activeFilter?.type === 'category' && activeFilter.value === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggleFilter({
                    type: 'category',
                    label: `Catégorie : ${c.name}`,
                    value: c.name
                  })}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></span>
                  <span>{c.name}: <strong>{c.value}</strong></span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Urgency Timeline */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-amber-600" />
                Échéancier & Urgence de Remise des Devis
              </h3>
              <p className="text-xs text-slate-500">
                Cliquez sur une échéance (ex: 3 - 7 jours) pour voir les offres
              </p>
            </div>
            {activeFilter?.type === 'urgency' && (
              <button
                onClick={() => onSelectFilter?.(null)}
                className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" /> Réinitialiser
              </button>
            )}
          </div>

          <div className="h-64 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deadlineUrgencyData}
                margin={{ top: 10, right: 10, left: -15, bottom: 10 }}
                onClick={(state: any) => {
                  const data = state?.activePayload?.[0]?.payload ||
                    (state?.activeTooltipIndex !== undefined ? deadlineUrgencyData[state.activeTooltipIndex] : null);
                  if (data && data.name) {
                    toggleFilter({
                      type: 'urgency',
                      label: `Échéancier : ${data.name}`,
                      value: data.name
                    });
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} avis (cliquez pour filtrer)`, 'Nombre d\'avis']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar
                  dataKey="avis"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                  onClick={(entry: any) => {
                    const name = entry?.name || entry?.payload?.name;
                    if (name) {
                      toggleFilter({
                        type: 'urgency',
                        label: `Échéancier : ${name}`,
                        value: name
                      });
                    }
                  }}
                >
                  {deadlineUrgencyData.map((entry, index) => {
                    const isSelected = activeFilter?.type === 'urgency' && activeFilter.value === entry.name;
                    const isOther = activeFilter?.type === 'urgency' && !isSelected;
                    return (
                      <Cell
                        key={`cell-urg-${index}`}
                        fill={entry.fill}
                        opacity={isOther ? 0.35 : 1}
                        stroke={isSelected ? '#0f172a' : '#ffffff'}
                        strokeWidth={isSelected ? 3 : 1}
                        className="cursor-pointer hover:opacity-85 transition"
                        onClick={() => {
                          toggleFilter({
                            type: 'urgency',
                            label: `Échéancier : ${entry.name}`,
                            value: entry.name
                          });
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Clickable Urgency Pills */}
          <div className="flex items-center justify-center gap-2 mt-2 pt-3 border-t border-slate-100 flex-wrap">
            {deadlineUrgencyData.map((u) => {
              const isSelected = activeFilter?.type === 'urgency' && activeFilter.value === u.name;
              return (
                <button
                  key={u.name}
                  type="button"
                  onClick={() => toggleFilter({
                    type: 'urgency',
                    label: `Échéancier : ${u.name}`,
                    value: u.name
                  })}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: u.fill }}></span>
                  <span>{u.name} (<strong>{u.avis}</strong>)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Top Buyers Ranking */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-600" />
                Principaux Acheteurs Publics
              </h3>
              <p className="text-xs text-slate-500">
                Cliquez sur un acheteur pour isoler toutes ses consultations
              </p>
            </div>
            {activeFilter?.type === 'buyer' && (
              <button
                onClick={() => onSelectFilter?.(null)}
                className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" /> Réinitialiser
              </button>
            )}
          </div>

          <div className="h-64 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topBuyersData}
                margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
                onClick={(state: any) => {
                  const data = state?.activePayload?.[0]?.payload ||
                    (state?.activeTooltipIndex !== undefined ? topBuyersData[state.activeTooltipIndex] : null);
                  if (data && data.fullBuyer) {
                    toggleFilter({
                      type: 'buyer',
                      label: `Acheteur : ${data.fullBuyer}`,
                      value: data.fullBuyer
                    });
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <YAxis
                  dataKey="buyer"
                  type="category"
                  tick={{ fontSize: 10, fill: '#334155' }}
                  width={130}
                />
                <Tooltip
                  formatter={(value: any) => [`${value} avis d'achats (cliquez pour filtrer)`, 'Avis publiés']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  className="cursor-pointer"
                  onClick={(entry: any) => {
                    const fullBuyer = entry?.fullBuyer || entry?.payload?.fullBuyer;
                    if (fullBuyer) {
                      toggleFilter({
                        type: 'buyer',
                        label: `Acheteur : ${fullBuyer}`,
                        value: fullBuyer
                      });
                    }
                  }}
                >
                  {topBuyersData.map((entry, index) => {
                    const isSelected = activeFilter?.type === 'buyer' && activeFilter.value === entry.fullBuyer;
                    const isOther = activeFilter?.type === 'buyer' && !isSelected;
                    const barColor = BUYER_COLORS[index % BUYER_COLORS.length];
                    return (
                      <Cell
                        key={`buyer-cell-${index}`}
                        fill={barColor}
                        opacity={isOther ? 0.35 : 1}
                        stroke={isSelected ? '#0f172a' : '#ffffff'}
                        strokeWidth={isSelected ? 3 : 1}
                        className="cursor-pointer hover:opacity-85 transition"
                        onClick={() => {
                          toggleFilter({
                            type: 'buyer',
                            label: `Acheteur : ${entry.fullBuyer}`,
                            value: entry.fullBuyer
                          });
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Clickable Buyer Pills */}
          <div className="flex items-center justify-center gap-2 mt-2 pt-3 border-t border-slate-100 flex-wrap">
            {topBuyersData.map((b, index) => {
              const isSelected = activeFilter?.type === 'buyer' && activeFilter.value === b.fullBuyer;
              const pillColor = BUYER_COLORS[index % BUYER_COLORS.length];
              return (
                <button
                  key={b.fullBuyer}
                  type="button"
                  onClick={() => toggleFilter({
                    type: 'buyer',
                    label: `Acheteur : ${b.fullBuyer}`,
                    value: b.fullBuyer
                  })}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title={b.fullBuyer}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pillColor }}></span>
                  <span className="truncate max-w-[180px]">{b.buyer} (<strong>{b.count}</strong>)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Geographic Distribution (Cities & Locations) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Distribution Géographique (Lieux d'exécution / Villes)
              </h3>
              <p className="text-xs text-slate-500">
                Classement des principales localités d'exécution des marchés
              </p>
            </div>
            {activeFilter?.type === 'location' && (
              <button
                onClick={() => onSelectFilter?.(null)}
                className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" /> Réinitialiser
              </button>
            )}
          </div>

          <div className="h-64 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={locationData}
                margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
                onClick={(state: any) => {
                  const data = state?.activePayload?.[0]?.payload ||
                    (state?.activeTooltipIndex !== undefined ? locationData[state.activeTooltipIndex] : null);
                  if (data && data.fullLocation) {
                    toggleFilter({
                      type: 'location',
                      label: `Lieu : ${data.fullLocation}`,
                      value: data.fullLocation
                    });
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="location"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} avis (cliquez pour filtrer)`, 'Consultations']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                  onClick={(entry: any) => {
                    const fullLocation = entry?.fullLocation || entry?.payload?.fullLocation;
                    if (fullLocation) {
                      toggleFilter({
                        type: 'location',
                        label: `Lieu : ${fullLocation}`,
                        value: fullLocation
                      });
                    }
                  }}
                >
                  {locationData.map((entry, index) => {
                    const isSelected = activeFilter?.type === 'location' && activeFilter.value === entry.fullLocation;
                    const isOther = activeFilter?.type === 'location' && !isSelected;
                    const barColor = LOCATION_COLORS[index % LOCATION_COLORS.length];
                    return (
                      <Cell
                        key={`loc-cell-${index}`}
                        fill={barColor}
                        opacity={isOther ? 0.35 : 1}
                        stroke={isSelected ? '#0f172a' : '#ffffff'}
                        strokeWidth={isSelected ? 3 : 1}
                        className="cursor-pointer hover:opacity-85 transition"
                        onClick={() => {
                          toggleFilter({
                            type: 'location',
                            label: `Lieu : ${entry.fullLocation}`,
                            value: entry.fullLocation
                          });
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Clickable Location Pills */}
          <div className="flex items-center justify-center gap-2 mt-2 pt-3 border-t border-slate-100 flex-wrap">
            {locationData.map((loc, index) => {
              const isSelected = activeFilter?.type === 'location' && activeFilter.value === loc.fullLocation;
              const pillColor = LOCATION_COLORS[index % LOCATION_COLORS.length];
              return (
                <button
                  key={loc.fullLocation}
                  type="button"
                  onClick={() => toggleFilter({
                    type: 'location',
                    label: `Lieu : ${loc.fullLocation}`,
                    value: loc.fullLocation
                  })}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pillColor }}></span>
                  <span>{loc.location} (<strong>{loc.count}</strong>)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart 5: Geographic Distribution by Moroccan Regions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-600" />
                Distribution Géographique par Région
              </h3>
              <p className="text-xs text-slate-500">
                Répartition des avis selon les 12 régions administratives du Royaume
              </p>
            </div>
            {activeFilter?.type === 'region' && (
              <button
                onClick={() => onSelectFilter?.(null)}
                className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" /> Réinitialiser
              </button>
            )}
          </div>

          <div className="h-64 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regionData}
                margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
                onClick={(state: any) => {
                  const data = state?.activePayload?.[0]?.payload ||
                    (state?.activeTooltipIndex !== undefined ? regionData[state.activeTooltipIndex] : null);
                  if (data && data.fullRegion) {
                    toggleFilter({
                      type: 'region',
                      label: `Région : ${data.fullRegion}`,
                      value: data.fullRegion
                    });
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="region"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} avis (cliquez pour filtrer)`, 'Consultations']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                  onClick={(entry: any) => {
                    const fullRegion = entry?.fullRegion || entry?.payload?.fullRegion;
                    if (fullRegion) {
                      toggleFilter({
                        type: 'region',
                        label: `Région : ${fullRegion}`,
                        value: fullRegion
                      });
                    }
                  }}
                >
                  {regionData.map((entry, index) => {
                    const isSelected = activeFilter?.type === 'region' && activeFilter.value === entry.fullRegion;
                    const isOther = activeFilter?.type === 'region' && !isSelected;
                    const barColor = REGION_COLORS[index % REGION_COLORS.length];
                    return (
                      <Cell
                        key={`reg-cell-${index}`}
                        fill={barColor}
                        opacity={isOther ? 0.35 : 1}
                        stroke={isSelected ? '#0f172a' : '#ffffff'}
                        strokeWidth={isSelected ? 3 : 1}
                        className="cursor-pointer hover:opacity-85 transition"
                        onClick={() => {
                          toggleFilter({
                            type: 'region',
                            label: `Région : ${entry.fullRegion}`,
                            value: entry.fullRegion
                          });
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Clickable Region Pills */}
          <div className="flex items-center justify-center gap-2 mt-2 pt-3 border-t border-slate-100 flex-wrap">
            {regionData.map((reg, index) => {
              const isSelected = activeFilter?.type === 'region' && activeFilter.value === reg.fullRegion;
              const pillColor = REGION_COLORS[index % REGION_COLORS.length];
              return (
                <button
                  key={reg.fullRegion}
                  type="button"
                  onClick={() => toggleFilter({
                    type: 'region',
                    label: `Région : ${reg.fullRegion}`,
                    value: reg.fullRegion
                  })}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pillColor }}></span>
                  <span>{reg.region} (<strong>{reg.count}</strong>)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart 6: Budget Range Buckets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                Répartition par Tranche Budgétaire Estimée (MAD)
              </h3>
              <p className="text-xs text-slate-500">
                Cliquez sur une tranche budgétaire pour afficher uniquement les avis de ce palier
              </p>
            </div>
            {activeFilter?.type === 'budget' && (
              <button
                onClick={() => onSelectFilter?.(null)}
                className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" /> Réinitialiser
              </button>
            )}
          </div>

          <div className="h-60 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetRangeData}
                margin={{ top: 10, right: 10, left: -15, bottom: 10 }}
                onClick={(state: any) => {
                  const data = state?.activePayload?.[0]?.payload ||
                    (state?.activeTooltipIndex !== undefined ? budgetRangeData[state.activeTooltipIndex] : null);
                  if (data && data.range) {
                    toggleFilter({
                      type: 'budget',
                      label: `Budget : ${data.range}`,
                      value: data.range
                    });
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} avis (cliquez pour filtrer)`, 'Avis']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar
                  dataKey="avis"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                  onClick={(entry: any) => {
                    const range = entry?.range || entry?.payload?.range;
                    if (range) {
                      toggleFilter({
                        type: 'budget',
                        label: `Budget : ${range}`,
                        value: range
                      });
                    }
                  }}
                >
                  {budgetRangeData.map((entry, index) => {
                    const isSelected = activeFilter?.type === 'budget' && activeFilter.value === entry.range;
                    const isOther = activeFilter?.type === 'budget' && !isSelected;
                    return (
                      <Cell
                        key={`cell-b-${index}`}
                        fill={entry.fill}
                        opacity={isOther ? 0.35 : 1}
                        stroke={isSelected ? '#0f172a' : '#ffffff'}
                        strokeWidth={isSelected ? 3 : 1}
                        className="cursor-pointer hover:opacity-85 transition"
                        onClick={() => {
                          toggleFilter({
                            type: 'budget',
                            label: `Budget : ${entry.range}`,
                            value: entry.range
                          });
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Clickable Budget Pills */}
          <div className="flex items-center justify-center gap-2 mt-2 pt-3 border-t border-slate-100 flex-wrap">
            {budgetRangeData.map((b) => {
              const isSelected = activeFilter?.type === 'budget' && activeFilter.value === b.range;
              return (
                <button
                  key={b.range}
                  type="button"
                  onClick={() => toggleFilter({
                    type: 'budget',
                    label: `Budget : ${b.range}`,
                    value: b.range
                  })}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.fill }}></span>
                  <span>{b.range} (<strong>{b.avis}</strong>)</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
