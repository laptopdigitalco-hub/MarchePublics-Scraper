import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CheckCircle, AlertTriangle, XCircle, Info, ChevronDown, ChevronUp, Copy, Check, Trash2, Globe } from 'lucide-react';
import { ScraperLog } from '../types';

interface LiveScraperTerminalProps {
  logs: ScraperLog[];
  isScraping: boolean;
  totalFound: number;
  scrapedCount: number;
  currentPage?: number;
  maxPages?: number;
  durationMs?: number;
  onClearLogs?: () => void;
}

export const LiveScraperTerminal: React.FC<LiveScraperTerminalProps> = ({
  logs,
  isScraping,
  totalFound,
  scrapedCount,
  currentPage = 1,
  maxPages = 1,
  durationMs = 0,
  onClearLogs
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isScraping) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isScraping]);

  const copyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message} ${l.url ? `(${l.url})` : ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogColor = (level: ScraperLog['level']) => {
    switch (level) {
      case 'success':
        return 'text-emerald-400';
      case 'warn':
        return 'text-amber-300';
      case 'error':
        return 'text-rose-400';
      default:
        return 'text-slate-300';
    }
  };

  const getLogIcon = (level: ScraperLog['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />;
      case 'warn':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />;
      case 'error':
        return <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="bg-slate-950 rounded-2xl shadow-md border border-slate-800 overflow-hidden font-mono text-xs flex flex-col h-full min-h-[460px]">
      
      {/* Terminal Title Bar */}
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-slate-200 font-semibold flex items-center gap-1.5 ml-2 text-xs">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Terminal Scrapping :: marchespublics.gov.ma
          </span>
          {isScraping && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
              <Globe className="w-3 h-3 animate-spin" />
              Crawling
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Stats pills */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 mr-1">
            <span className="bg-slate-800 px-2 py-0.5 rounded">
              P: <strong className="text-slate-200">{currentPage}/{maxPages}</strong>
            </span>
            <span className="bg-slate-800 px-2 py-0.5 rounded">
              Extraits: <strong className="text-emerald-400">{scrapedCount}</strong>
            </span>
            {durationMs > 0 && (
              <span className="bg-slate-800 px-2 py-0.5 rounded">
                Temps: <strong className="text-cyan-400">{(durationMs / 1000).toFixed(1)}s</strong>
              </span>
            )}
          </div>

          <button
            onClick={copyLogs}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition cursor-pointer"
            title="Copier les logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition cursor-pointer"
              title="Effacer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition cursor-pointer"
            title={isOpen ? "Réduire" : "Agrandir"}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isScraping && (
        <div className="w-full bg-slate-900 h-1 relative overflow-hidden shrink-0">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 animate-pulse w-full"></div>
        </div>
      )}

      {/* Log Entries Container */}
      {isOpen && (
        <div
          ref={scrollRef}
          className="p-4 flex-1 overflow-y-auto space-y-1.5 leading-relaxed selection:bg-emerald-900 selection:text-white min-h-[350px] max-h-[560px]"
        >
          {logs.length === 0 ? (
            <div className="text-slate-500 py-10 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
                <Terminal className="w-6 h-6" />
              </div>
              <div className="text-slate-300 font-semibold text-xs">
                Moteur Scrapping Adaptor & StealthyFetcher prêt
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Définissez vos critères de recherche sur la gauche (acheteur libre par défaut), puis cliquez sur <strong className="text-emerald-400">"Lancer le Scraper"</strong> pour débuter l'extraction en temps réel.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-slate-600 font-mono">
                <span>Cible: marchespublics.gov.ma</span>
                <span>•</span>
                <span>Port: 443 HTTPS</span>
              </div>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 group hover:bg-slate-900/50 p-0.5 rounded">
                <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                {getLogIcon(log.level)}
                <span className={`break-all ${getLogColor(log.level)}`}>
                  {log.message}
                  {log.url && (
                    <span className="text-slate-500 block text-[10px] pl-2 hover:underline truncate">
                      ↳ {log.url}
                    </span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Terminal Footer Status Bar */}
      <div className="bg-slate-900/80 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 mt-auto shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
          <span className="text-slate-300 font-medium">
            {isScraping ? 'Extraction en cours...' : 'Prêt pour consultation'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span>Anti-fingerprint UA</span>
          <span>•</span>
          <span className="font-mono text-emerald-500/80">Stealth Mode</span>
        </div>
      </div>

    </div>
  );
};
