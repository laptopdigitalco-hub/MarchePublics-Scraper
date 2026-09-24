import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  Building,
  Layers,
  Coins,
  Package,
  Download,
  FileText,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TenderItem } from '../types';
import { getEffectiveTenderStatus, isTenderExpired } from '../utils/chartFilters';

interface TenderDetailModalProps {
  tender: TenderItem | null;
  onClose: () => void;
  onUpdateTender?: (updated: TenderItem) => void;
}

export const TenderDetailModal: React.FC<TenderDetailModalProps> = ({
  tender,
  onClose,
  onUpdateTender
}) => {
  const [currentTender, setCurrentTender] = useState<TenderItem | null>(tender);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [justFetched, setJustFetched] = useState<boolean>(false);

  useEffect(() => {
    setCurrentTender(tender);
    setFetchError(null);
    setJustFetched(false);

    if (tender && tender.id && !tender.id.startsWith('tender-')) {
      // If details are missing or have placeholder, automatically fetch them from the portal!
      const needsDetails =
        !tender.articles ||
        tender.articles.length === 0 ||
        tender.naturePrestation.includes('attente') ||
        !tender.datePublication;

      if (needsDetails) {
        fetchLiveDetails(tender.id);
      }
    }
  }, [tender]);

  const fetchLiveDetails = async (id: string) => {
    setLoadingDetails(true);
    setFetchError(null);

    try {
      const res = await fetch(`/api/tender/${id}`);
      const data = await res.json();

      if (data.success && data.details) {
        setCurrentTender((prev) => {
          if (!prev) return null;
          const updated: TenderItem = {
            ...prev,
            ...data.details
          };
          if (onUpdateTender) {
            onUpdateTender(updated);
          }
          return updated;
        });
        setJustFetched(true);
      } else {
        setFetchError(data.error || 'Impossible d’extraire les détails du portail.');
      }
    } catch (err: any) {
      setFetchError(err.message || 'Erreur de connexion');
    } finally {
      setLoadingDetails(false);
    }
  };

  if (!currentTender) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-slate-100 border-b border-slate-200 text-slate-800 p-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-mono text-sm font-bold text-emerald-700">
                Avis d'Achat {currentTender.reference}
              </span>
              <span className="text-xs text-slate-500">
                #ID {currentTender.id}
              </span>
              {(() => {
                const effStatus = getEffectiveTenderStatus(currentTender);
                return (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    effStatus === 'Annulé'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : effStatus === 'Attribué'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : effStatus === 'Infructueux'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : effStatus === 'Clôturé'
                      ? 'bg-slate-200 text-slate-700 border border-slate-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {effStatus}
                  </span>
                );
              })()}
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-white border border-slate-300 text-slate-700 shadow-2xs">
                {currentTender.categorie}
              </span>
              {justFetched && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Détails extraits du portail
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {currentTender.objet}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Extraction Banner if fetching */}
        {loadingDetails && (
          <div className="bg-emerald-900/10 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              <span>Extraction en direct sur <strong>marchespublics.gov.ma</strong> (Nature de prestation, Articles, Devis, Budget)...</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-mono">Scrapping detail crawler</span>
          </div>
        )}

        {/* Error notification if extraction failed */}
        {fetchError && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{fetchError} - Affichage des données disponibles.</span>
            </div>
            <button
              onClick={() => fetchLiveDetails(currentTender.id)}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Key Info Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* Buyer */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Acheteur Public
              </div>
              <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                {currentTender.acheteur}
              </div>
            </div>

            {/* Location */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Lieu d'Exécution
              </div>
              <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                {currentTender.lieuExecution}
              </div>
            </div>

            {/* Estimated Budget */}
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium mb-1">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                Budget Estimé / Montant
              </div>
              <div className="font-black text-emerald-900 text-base">
                {currentTender.budgetEstimeFormatted}
              </div>
              <span className="text-[10px] text-emerald-700">
                {currentTender.budgetType === 'explicit' ? 'Chiffré dans la consultation' : 'Plafond réglementaire BDC décret marchés publics'}
              </span>
            </div>

            {/* Publication Date */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                Mise en Ligne
              </div>
              <div className="font-semibold text-slate-800 text-xs">
                {currentTender.datePublication || 'Non précisé'}
              </div>
            </div>

            {/* Deadline */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 sm:col-span-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Date Limite de Remise des Devis
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="font-bold text-slate-900 text-sm">
                  {currentTender.dateLimite}
                </div>
                {isTenderExpired(currentTender) ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-200 text-slate-700 border border-slate-300">
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                    Délai expiré (Consultation clôturée)
                  </span>
                ) : currentTender.timeRemainingHours !== undefined && currentTender.timeRemainingHours > 0 ? (
                  <span className={`text-xs font-semibold ${currentTender.timeRemainingHours <= 72 ? 'text-rose-600' : 'text-amber-700'}`}>
                    ⏰ {Math.round(currentTender.timeRemainingHours / 24)} jours restants ({currentTender.timeRemainingHours} heures)
                  </span>
                ) : null}
              </div>
            </div>

          </div>

          {/* Nature of Prestation - Highlighted Section */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/70 relative">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Nature de la Prestation (Définition Portuaire / BDC)
              </span>
              <button
                type="button"
                onClick={() => fetchLiveDetails(currentTender.id)}
                disabled={loadingDetails}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${loadingDetails ? 'animate-spin' : ''}`} />
                Actualiser détails
              </button>
            </div>
            <p className="text-slate-900 font-bold text-sm">
              {currentTender.naturePrestation}
            </p>
          </div>

          {/* Articles Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                Détail des Articles / Lots Spécifiés ({currentTender.articles?.length || 0})
              </h3>
              {(!currentTender.articles || currentTender.articles.length === 0) && (
                <button
                  type="button"
                  onClick={() => fetchLiveDetails(currentTender.id)}
                  disabled={loadingDetails}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 inline-flex items-center gap-1 transition"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingDetails ? 'animate-spin' : ''}`} />
                  Extraire les articles depuis le portail
                </button>
              )}
            </div>

            {currentTender.articles && currentTender.articles.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">#</th>
                      <th className="py-2.5 px-3">Désignation & Spécifications Techniques</th>
                      <th className="py-2.5 px-3 text-center">Unité</th>
                      <th className="py-2.5 px-3 text-center">Quantité</th>
                      <th className="py-2.5 px-3 text-center">TVA (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentTender.articles.map((art) => (
                      <tr key={art.index} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                          {art.index}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">
                            {art.title}
                          </div>
                          {art.specification && (
                            <div className="text-[11px] text-slate-600 mt-1 whitespace-pre-line bg-slate-50 p-2 rounded border border-slate-100">
                              {art.specification}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700 font-bold">
                          {art.unit || 'U'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-700 font-mono text-sm">
                          {art.quantity || 1}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600">
                          {art.tva ? `${art.tva}%` : '20%'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-1">
                <p className="font-medium text-slate-700">Aucun lot spécifique n'est listé en page principale pour ce bon de commande.</p>
                <p>Consultez le dossier de consultation (DCE / Bon de commande) téléchargeable ci-dessous.</p>
              </div>
            )}
          </div>

          {/* Attachments Section */}
          {currentTender.piecesJointes && currentTender.piecesJointes.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-600" />
                Pièces Jointes & Dossier de Consultation ({currentTender.piecesJointes.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentTender.piecesJointes.map((p, idx) => (
                  <a
                    key={idx}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{p.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Source officielle : marchespublics.gov.ma
          </span>
          <div className="flex items-center gap-2">
            <a
              href={currentTender.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm"
            >
              <span>Accéder sur le Portail Officiel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-medium transition"
            >
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
