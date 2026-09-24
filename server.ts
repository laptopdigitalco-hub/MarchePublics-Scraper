import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { runScraplingCrawl, getRealisticMoroccanTenders, buildSearchUrl, extractConsultationDetails } from './server/scraper.ts';
import { ScraperSearchParams } from './src/types.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', engine: 'Scrapling-Engine', version: '1.0.0' });
  });

  // API Route: Extract live details for a single tender
  app.get('/api/tender/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const details = await extractConsultationDetails(id);
      res.json({ success: true, details });
    } catch (err: any) {
      console.error(`Error extracting details for tender ${id}:`, err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Sample data for instant dashboard preview
  app.get('/api/sample', (req: Request, res: Response) => {
    const tenders = getRealisticMoroccanTenders();
    res.json({
      success: true,
      totalFound: tenders.length,
      pagesScraped: 1,
      tenders,
      logs: [
        {
          id: 'log-sample-1',
          timestamp: new Date().toLocaleTimeString('fr-FR'),
          level: 'info',
          message: '[Scrapling::Engine] Loaded sample Moroccan public tender dataset.'
        }
      ],
      durationMs: 45
    });
  });

  // API Route: Execute Scrapling Crawl with Server-Sent Events (SSE) or JSON
  app.post('/api/scrape', async (req: Request, res: Response) => {
    const params: ScraperSearchParams = req.body || {};
    const startTime = Date.now();

    try {
      // Run the crawl
      const result = await runScraplingCrawl(params);
      const durationMs = Date.now() - startTime;

      res.json({
        success: true,
        totalFound: result.totalFound,
        pagesScraped: params.maxPages || 1,
        tenders: result.tenders,
        logs: result.logs,
        durationMs
      });
    } catch (err: any) {
      console.error('Scrape execution error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Scraping failed',
        tenders: getRealisticMoroccanTenders(params.keyword || params.buyer),
        durationMs: Date.now() - startTime
      });
    }
  });

  // API Route: Generate Scrapling Python Script
  app.post('/api/export-python', (req: Request, res: Response) => {
    const params: ScraperSearchParams = req.body || {};
    const searchUrl = buildSearchUrl(params, 1);

    const script = `"""
MarchePublics.gov.ma Scraper
Powered by Scrapling (https://github.com/D4Vinci/Scrapling)

Installation:
    pip install scrapling
"""

import json
import time
from scrapling.parser import Adaptor
from scrapling.fetchers import StealthyFetcher

BASE_URL = "https://www.marchespublics.gov.ma"
SEARCH_URL = "${searchUrl}"
MAX_PAGES = ${params.maxPages || 2}
DEEP_SCRAPING = ${params.deepScraping ? 'True' : 'False'}

def scrape_marche_publics():
    fetcher = StealthyFetcher()
    all_tenders = []
    
    print(f"[*] Starting Scrapling crawler for {SEARCH_URL}")
    
    for page in range(1, MAX_PAGES + 1):
        url = SEARCH_URL + (f"&page={page}" if page > 1 else "")
        print(f"[*] Crawling page {page}: {url}")
        
        try:
            response = fetcher.fetch(url)
            page_adaptor = Adaptor(response.text)
            
            cards = page_adaptor.css(".entreprise__card")
            print(f"[+] Found {len(cards)} consultations on page {page}")
            
            if not cards:
                break
                
            for card in cards:
                link_el = card.css_first("a[href*='/consultation/show/']")
                href = link_el.attrib.get('href', '') if link_el else ''
                consultation_id = href.split('/')[-1] if href else ''
                
                ref = card.css_first(".table__links").text.replace("Référence :", "").strip() if card.css_first(".table__links") else ""
                objet = card.css_first(".truncate_fullWidth").text.replace("Objet :", "").strip() if card.css_first(".truncate_fullWidth") else ""
                buyer = card.css_first("a:contains('Acheteur :')").text.replace("Acheteur :", "").strip() if card.css_first("a:contains('Acheteur :')") else ""
                
                tender = {
                    "id": consultation_id,
                    "reference": ref,
                    "objet": objet,
                    "acheteur": buyer,
                    "url": f"{BASE_URL}{href}",
                    "page": page
                }
                
                # Deep scraping for details, articles and estimated budget
                if DEEP_SCRAPING and consultation_id:
                    detail_url = f"{BASE_URL}/bdc/entreprise/consultation/show/{consultation_id}"
                    time.sleep(0.5) # Polite delay
                    detail_resp = fetcher.fetch(detail_url)
                    detail_adaptor = Adaptor(detail_resp.text)
                    
                    cat = detail_adaptor.css_first("#category").text if detail_adaptor.css_first("#category") else ""
                    nature = detail_adaptor.css_first("#screwdriver").text if detail_adaptor.css_first("#screwdriver") else ""
                    tender["categorie"] = cat.strip()
                    tender["nature_prestation"] = nature.strip()
                
                all_tenders.append(tender)
                
        except Exception as e:
            print(f"[-] Error crawling page {page}: {e}")
            break
            
    print(f"[+] Crawl complete. Total extracted: {len(all_tenders)}")
    with open("marchespublics_tenders.json", "w", encoding="utf-8") as f:
        json.dump(all_tenders, f, ensure_ascii=False, indent=2)
    print("[+] Saved to marchespublics_tenders.json")

if __name__ == "__main__":
    scrape_marche_publics()
`;

    res.json({ script });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Scrapling-Engine] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
