import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SearchControls } from './components/SearchControls';
import { LiveScraperTerminal } from './components/LiveScraperTerminal';
import { InsightMetrics } from './components/InsightMetrics';
import { InsightCharts } from './components/InsightCharts';
import { TenderTable } from './components/TenderTable';
import { TenderDetailModal } from './components/TenderDetailModal';
import { ScraplingPythonModal } from './components/ScraplingPythonModal';
import { TenderItem, ScraperSearchParams, ScraperLog, ChartFilter } from './types';
import { filterTendersByChart } from './utils/chartFilters';
import { AlertCircle, RefreshCw, BarChart3, ListFilter, Sparkles } from 'lucide-react';

const INITIAL_PARAMS: ScraperSearchParams = {
  keyword: '',
  reference: '',
  objet: '',
  buyer: '',
  service: '',
  location: '',
  categorie: '',
  naturePrestation: '',
  dateLimiteStart: '',
  dateLimiteEnd: '',
  dateMiseEnLigneStart: '',
  dateMiseEnLigneEnd: '',
  pageSize: 50,
  maxPages: 1,
  deepScraping: true,
  delayMs: 300
};

export default function App() {
  const [params, setParams] = useState<ScraperSearchParams>(INITIAL_PARAMS);
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [logs, setLogs] = useState<ScraperLog[]>([]);
  const [totalFound, setTotalFound] = useState<number>(0);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [durationMs, setDurationMs] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedTender, setSelectedTender] = useState<TenderItem | null>(null);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table'>('table');
  const [chartFilter, setChartFilter] = useState<ChartFilter | null>(null);

  // Filtered tenders based on interactive chart selection
  const displayTenders = useMemo(() => {
    return filterTendersByChart(tenders, chartFilter);
  }, [tenders, chartFilter]);

  const handleSelectChartFilter = (filter: ChartFilter | null) => {
    setChartFilter(filter);
    if (filter) {
      setTimeout(() => {
        const targetEl = document.getElementById('filtered-offers-section');
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  };

  // Load sample dataset helper
  const loadSampleData = async () => {
    try {
      const res = await fetch('/api/sample');
      const data = await res.json();
      if (data.success) {
        setTenders(data.tenders);
        setTotalFound(data.totalFound);
        setLogs(data.logs || []);
        setError(null);
      }
    } catch (err: any) {
      console.error('Failed to load sample dataset:', err);
    }
  };

  const handleScrape = async () => {
    setIsScraping(true);
    setError(null);

    const initialLog: ScraperLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      level: 'info',
      message: `[Scrapping::Client] Lancement du crawl sur marchespublics.gov.ma (acheteur="${params.buyer || 'Tous'}", mot-clé="${params.keyword || 'Tous'}", maxPages=${params.maxPages})...`
    };
    setLogs([initialLog]);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      const data = await response.json();

      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }

      if (data.tenders && Array.isArray(data.tenders)) {
        setTenders(data.tenders);
        setTotalFound(data.totalFound || data.tenders.length);
        setDurationMs(data.durationMs || 0);
      }

      if (!data.success && data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la communication avec le scraper');
      const errorLog: ScraperLog = {
        id: `log-${Date.now()}-err`,
        timestamp: new Date().toLocaleTimeString('fr-FR'),
        level: 'error',
        message: `[Scrapping::Error] Échec de la requête: ${err.message}`
      };
      setLogs((prev) => [...prev, errorLog]);
    } finally {
      setIsScraping(false);
    }
  };

  const handleReset = () => {
    setParams(INITIAL_PARAMS);
    setTenders([]);
    setLogs([]);
    setTotalFound(0);
    setDurationMs(0);
    setError(null);
    setSelectedTender(null);
    setChartFilter(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      
      {/* Header */}
      <Header
        tendersCount={tenders.length}
        totalFound={totalFound}
        isScraping={isScraping}
        onRefreshSample={loadSampleData}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error notification if any */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-semibold text-rose-700 hover:underline cursor-pointer"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Top Split Section: Search Parameters (Left Half) & Live Scraper Terminal (Right Half) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* 1. Search Controls & Input Parameters */}
          <SearchControls
            params={params}
            onChange={setParams}
            onScrape={handleScrape}
            onReset={handleReset}
            onLoadSample={loadSampleData}
            isScraping={isScraping}
          />

          {/* 2. Scrapling Live Crawling Terminal (Right Half) */}
          <LiveScraperTerminal
            logs={logs}
            isScraping={isScraping}
            totalFound={totalFound}
            scrapedCount={tenders.length}
            currentPage={1}
            maxPages={params.maxPages}
            durationMs={durationMs}
            onClearLogs={() => setLogs([])}
          />
        </div>

        {/* 3. High-Level Insights Metrics */}
        <InsightMetrics
          tenders={tenders}
          totalFoundOnPortal={totalFound}
        />

        {/* 4. Tab Switcher (Tableau des Avis vs Dashboard) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('table')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'table'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ListFilter className="w-4 h-4 text-cyan-400" />
              Tableau des Avis ({displayTenders.length}{chartFilter ? ` / ${tenders.length}` : ''})
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Analytique & Graphiques
            </button>
          </div>

          <div className="text-xs text-slate-500 hidden sm:block">
            {displayTenders.length} consultation{displayTenders.length > 1 ? 's' : ''} affichée{displayTenders.length > 1 ? 's' : ''}
            {chartFilter && <span className="text-emerald-700 font-semibold ml-1">(filtré)</span>}
          </div>
        </div>

        {/* 5. View Content: Dashboard Charts or Table */}
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            <InsightCharts
              tenders={tenders}
              activeFilter={chartFilter}
              onSelectFilter={handleSelectChartFilter}
            />
            <div className="pt-2" id="filtered-offers-section">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-emerald-600" />
                    {chartFilter ? (
                      <span>
                        Offres correspondantes ({displayTenders.length}) : <strong className="text-emerald-700 font-bold">{chartFilter.label}</strong>
                      </span>
                    ) : (
                      <span>Aperçu de toutes les consultations ({displayTenders.length})</span>
                    )}
                  </h3>
                  {chartFilter && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ces résultats sont filtrés selon votre sélection sur le graphique ci-dessus.
                    </p>
                  )}
                </div>

                {chartFilter && (
                  <button
                    onClick={() => setChartFilter(null)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>✕</span>
                    <span>Afficher toutes les offres ({tenders.length})</span>
                  </button>
                )}
              </div>

              <TenderTable
                tenders={displayTenders}
                onSelectTender={setSelectedTender}
                activeChartFilter={chartFilter}
                onClearChartFilter={() => setChartFilter(null)}
              />
            </div>
          </div>
        ) : (
          <TenderTable
            tenders={displayTenders}
            onSelectTender={setSelectedTender}
            activeChartFilter={chartFilter}
            onClearChartFilter={() => setChartFilter(null)}
          />
        )}

      </main>

      {/* Tender Specification Detail Modal */}
      <TenderDetailModal
        tender={selectedTender}
        onClose={() => setSelectedTender(null)}
        onUpdateTender={(updated) => {
          setSelectedTender(updated);
          setTenders((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        }}
      />

      {/* Scrapling Python Code Modal */}
      <ScraplingPythonModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        params={params}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Portail des Marchés Publics du Maroc</span>
            <span>•</span>
            <span>Moteur Scrapping Adaptor & StealthyFetcher</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://www.marchespublics.gov.ma"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 transition"
            >
              marchespublics.gov.ma
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
