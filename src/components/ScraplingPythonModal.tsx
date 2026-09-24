import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, Code2, Play } from 'lucide-react';
import { ScraperSearchParams } from '../types';

interface ScraplingPythonModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: ScraperSearchParams;
}

export const ScraplingPythonModal: React.FC<ScraplingPythonModalProps> = ({
  isOpen,
  onClose,
  params
}) => {
  const [copied, setCopied] = useState(false);
  const [pythonCode, setPythonCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/export-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
        .then((r) => r.json())
        .then((data) => {
          setPythonCode(data.script || '');
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [isOpen, params]);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-slate-950 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Générateur de Script Scrapping (Python)
                <a
                  href="https://github.com/D4Vinci/Scrapling"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-normal"
                >
                  (GitHub: D4Vinci/Scrapling)
                  <ExternalLink className="w-3 h-3" />
                </a>
              </h3>
              <p className="text-xs text-slate-400">
                Script autonome prêt à exécuter avec vos filtres actuels
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setup banner */}
        <div className="bg-slate-900/50 p-4 border-b border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-white block mb-0.5">Pour exécuter en local :</span>
            <code className="text-emerald-400 bg-slate-950 px-2 py-1 rounded font-mono border border-slate-800">
              pip install scrapling
            </code>
          </div>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copié !' : 'Copier le script'}
          </button>
        </div>

        {/* Code View */}
        <div className="p-4 overflow-y-auto font-mono text-xs leading-relaxed text-slate-300 bg-slate-950 max-h-[60vh]">
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              Génération du script Scrapping...
            </div>
          ) : (
            <pre className="whitespace-pre overflow-x-auto selection:bg-emerald-900 selection:text-white">
              {pythonCode}
            </pre>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Utilise <code className="text-slate-200">StealthyFetcher</code> et <code className="text-slate-200">Adaptor</code> de Scrapping
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition font-medium"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
