import React, { useState } from 'react';
import {
  Search,
  Filter,
  Sliders,
  MapPin,
  Building,
  Calendar,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ScraperSearchParams } from '../types';
import {
  PROCUREMENT_CATEGORIES,
  NATURE_PRESTATIONS
} from '../data/categories';

interface SearchControlsProps {
  params: ScraperSearchParams;
  onChange: (params: ScraperSearchParams) => void;
  onScrape: () => void;
  onReset: () => void;
  onLoadSample?: () => void;
  isScraping: boolean;
}

export const SearchControls: React.FC<SearchControlsProps> = ({
  params,
  onChange,
  onScrape,
  onReset,
  isScraping
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateParam = <K extends keyof ScraperSearchParams>(key: K, value: ScraperSearchParams[K]) => {
    onChange({
      ...params,
      [key]: value
    });
  };

  const handleResetClick = () => {
    setShowAdvanced(false);
    onReset();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      
      {/* Header bar of search card */}
      <div className="bg-gradient-to-r from-slate-50 to-emerald-50/40 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-700 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
              Paramètres de Recherche & Scraper
            </h2>
            <p className="text-xs text-slate-500">
              Cible : <span className="font-mono text-emerald-700">marchespublics.gov.ma</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        
        <div className="space-y-4">
          {/* Primary Inputs: Mot clé on top, then Acheteur & Lieu in 2 columns */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Recherche par mot clé (keyword)
            </label>
            <div className="relative">
              <input
                type="text"
                value={params.keyword}
                onChange={(e) => updateParam('keyword', e.target.value)}
                placeholder="Ex: ambulance, scanner, bitumage, fourniture, travaux..."
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Acheteur / Buyer - Default is free/empty */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Acheteur public (buyer)
                </label>
                {params.buyer ? (
                  <button
                    type="button"
                    onClick={() => updateParam('buyer', '')}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
                  >
                    Effacer (Rendre libre)
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                    Libre / Tous
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={params.buyer}
                  onChange={(e) => updateParam('buyer', e.target.value)}
                  placeholder="Ex: commune, ministère, régie, province..."
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                {params.buyer && (
                  <button
                    type="button"
                    onClick={() => updateParam('buyer', '')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                    title="Vider l'acheteur"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Lieu d'exécution / Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lieu d'exécution (location)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={params.location}
                  onChange={(e) => updateParam('location', e.target.value)}
                  placeholder="Ex: RABAT, CASABLANCA, FES..."
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition uppercase"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Toggle Advanced Filters */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              {showAdvanced ? 'Masquer les filtres avancés' : 'Afficher les filtres avancés (Dates, Référence, Catégorie...)'}
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-3.5 pt-2 border-t border-slate-100">
              
              {/* Row: Reference & Objet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Référence consultation
                  </label>
                  <input
                    type="text"
                    value={params.reference}
                    onChange={(e) => updateParam('reference', e.target.value)}
                    placeholder="Ex: 6/2026, 01/BG/2026..."
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Objet du marché
                  </label>
                  <input
                    type="text"
                    value={params.objet}
                    onChange={(e) => updateParam('objet', e.target.value)}
                    placeholder="Ex: TRAVAUX, FOURNITURE..."
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Row: Category & Nature de prestation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Catégorie principale
                  </label>
                  <div className="relative">
                    <select
                      value={params.categorie}
                      onChange={(e) => updateParam('categorie', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition appearance-none cursor-pointer"
                    >
                      {PROCUREMENT_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <Layers className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nature de prestation
                  </label>
                  <select
                    value={params.naturePrestation}
                    onChange={(e) => updateParam('naturePrestation', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition cursor-pointer"
                  >
                    {NATURE_PRESTATIONS.map((n) => (
                      <option key={n.value} value={n.value}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: Dates */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-600" />
                    Date limite (Début)
                  </label>
                  <input
                    type="text"
                    value={params.dateLimiteStart}
                    onChange={(e) => updateParam('dateLimiteStart', e.target.value)}
                    placeholder="JJ/MM/AAAA"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-600" />
                    Date limite (Fin)
                  </label>
                  <input
                    type="text"
                    value={params.dateLimiteEnd}
                    onChange={(e) => updateParam('dateLimiteEnd', e.target.value)}
                    placeholder="JJ/MM/AAAA"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-cyan-600" />
                    Mise en ligne (Début)
                  </label>
                  <input
                    type="text"
                    value={params.dateMiseEnLigneStart}
                    onChange={(e) => updateParam('dateMiseEnLigneStart', e.target.value)}
                    placeholder="JJ/MM/AAAA"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-cyan-600" />
                    Mise en ligne (Fin)
                  </label>
                  <input
                    type="text"
                    value={params.dateMiseEnLigneEnd}
                    onChange={(e) => updateParam('dateMiseEnLigneEnd', e.target.value)}
                    placeholder="JJ/MM/AAAA"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row: Scrapping Crawler Configuration */}
              <div className="bg-emerald-950/5 p-3.5 rounded-xl border border-emerald-600/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Moteur Scrapping Multi-Pages
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Stealth & rate-limiting
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                  {/* Page Size & Max Pages */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Avis / page
                      </label>
                      <select
                        value={params.pageSize}
                        onChange={(e) => updateParam('pageSize', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Pages max
                      </label>
                      <select
                        value={params.maxPages}
                        onChange={(e) => updateParam('maxPages', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value={1}>1 page</option>
                        <option value={2}>2 pages</option>
                        <option value={3}>3 pages</option>
                        <option value={5}>5 pages</option>
                      </select>
                    </div>
                  </div>

                  {/* Deep Scraping Toggle */}
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <div className="pr-2">
                      <span className="block text-[11px] font-semibold text-slate-800 leading-tight">
                        Détails approfondis
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Articles, devis & pièces
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={params.deepScraping}
                        onChange={(e) => updateParam('deepScraping', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-200 mt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetClick}
              disabled={isScraping}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          </div>

          <button
            type="button"
            onClick={onScrape}
            disabled={isScraping}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition inline-flex items-center gap-2 cursor-pointer ${
              isScraping
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-700/20 active:scale-[0.98]'
            }`}
          >
            {isScraping ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Scraping...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Lancer le Scraper</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
