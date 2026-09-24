import React from 'react';
import { ExternalLink } from 'lucide-react';

interface HeaderProps {
  tendersCount: number;
  totalFound: number;
  isScraping: boolean;
  onRefreshSample: () => void;
  onOpenPythonModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tendersCount,
  totalFound,
  isScraping,
  onRefreshSample,
  onOpenPythonModal
}) => {
  return (
    <header className="bg-slate-100/95 backdrop-blur-md border-b border-slate-200 text-slate-800 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Portal Info */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                marchespublics.gov.ma
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Portail Connecté
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Scraper multi-pages & Tableau de bord décisionnel des avis d'achat publics du Maroc
            </p>
          </div>
        </div>

        {/* Quick Actions & Live Stats */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex flex-col text-right px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-xs">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Avis en mémoire</span>
            <span className="text-sm font-bold text-slate-900">
              {tendersCount} {totalFound > tendersCount ? <span className="text-xs font-normal text-slate-500">/ {totalFound.toLocaleString()} sur le portail</span> : ''}
            </span>
          </div>

          <a
            href="https://www.marchespublics.gov.ma/bdc/entreprise/consultation/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-emerald-700 border border-slate-200 transition shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portail</span> Officiel
          </a>
        </div>

      </div>
    </header>
  );
};
