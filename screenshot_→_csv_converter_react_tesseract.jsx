import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Robust OCR pipeline with:
// 1) Web Worker running Tesseract via CDN (serializable messages only)
// 2) Automatic fallback to main-thread OCR using UMD script injection (no dynamic import),
//    avoiding environments that rewrite bare URL imports and cause malformed URLs.

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Download, Image as ImageIcon, Loader2, Upload, Wand2 } from "lucide-react";

// =====================
// Helpers (CSV + parsing)
// =====================
function csvEscape(value: unknown) {
  if (value == null) return "";
  const s = String(value);
  const mustQuote = s.includes(",") || s.includes("\n") || s.includes('"');
  const escaped = s.replaceAll('"', '""');
  return mustQuote ? `"${escaped}"` : escaped;
}

function rowsToCSV(rows: string[][]) {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\n");
}

function smartSplitLines(text: string) {
  const rawLines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/[\u200B\u200C\u200D\uFEFF]/g, "").trim());
  const lines = rawLines.filter((l) => l.length > 0);
  return lines;
}

function guessDelimiter(lines: string[]) {
  const delimiters = [
    { label: "Tabs", rx: /\t+/g },
    { label: "Pipes |", rx: /\s*\|\s*/g },
    { label: "Semicolons ;", rx: /\s*;\s*/g },
    { label: "Multiple spaces", rx: /\s{2,}/g },
  ];
  let best: { score: number; rx: RegExp; label: string } = { score: -Infinity, rx: /\s{2,}/g, label: "Multiple spaces" };
  for (const d of delimiters) {
    const counts = lines.slice(0, 30).map((l) => l.split(d.rx).length);
    if (counts.length === 0) continue;
    const mode = counts.slice().sort((a, b) => a - b)[Math.floor(counts.length / 2)];
    const variance = counts.reduce((acc, c) => acc + Math.abs(c - mode), 0);
    const score = (mode || 0) * 10 - variance;
    if (score > best.score) best = { score, rx: d.rx, label: d.label };
  }
  return best;
}

function parseTable(text: string, options?: { delimiter?: { rx: RegExp; label?: string } }) {
  const lines = smartSplitLines(text);
  const { rx } = options?.delimiter || guessDelimiter(lines);
  let rows = lines.map((l) => l.split(rx).map((c) => c.trim()));

  const colCounts = rows.map((r) => r.length);
  const modeCols = (() => {
    const freq = new Map<number, number>();
    for (const n of colCounts) freq.set(n, (freq.get(n) || 0) + 1);
    const best = [...freq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? colCounts[0] ?? 1;
    return best;
  })();

  rows = rows
    .filter((r) => r.length >= Math.max(1, Math.floor(modeCols * 0.6)))
    .map((r) => {
      if (r.length < modeCols) return [...r, ...Array(modeCols - r.length).fill("")];
      if (r.length > modeCols) return r.slice(0, modeCols);
      return r;
    });

  return { rows, modeCols } as { rows: string[][]; modeCols: number };
}

// =====================
// Unit Tests (kept + extended)
// =====================
function runUnitTests() {
  const results: { name: string; pass: boolean; details?: string }[] = [];
  try {
    // csvEscape tests
    results.push({ name: 'csvEscape simple', pass: csvEscape('abc') === 'abc' });
    results.push({ name: 'csvEscape quotes', pass: csvEscape('a"b') === '"a""b"' });
    results.push({ name: 'csvEscape comma', pass: csvEscape('a,b') === '"a,b"' });
    results.push({ name: 'csvEscape newline', pass: csvEscape('a\nb') === '"a\nb"' });

    // parseTable tests
    const t1 = parseTable('A  B  C\n1  2  3\n4  5  6');
    results.push({ name: 'parseTable multi-space cols', pass: t1.rows.length === 3 && t1.rows[0].length === 3 });

    const t2 = parseTable('A|B|C\n1|2|3', { delimiter: { rx: /\s*\|\s*/g } });
    results.push({ name: 'parseTable pipes', pass: t2.rows.length === 2 && t2.rows[1][2] === '3' });

    const t3 = parseTable('A\tB\tC\n7\t8\t9', { delimiter: { rx: /\t+/g } });
    results.push({ name: 'parseTable tabs', pass: t3.rows[1][0] === '7' && t3.rows[1][2] === '9' });

    const t4 = parseTable('OnlyOneColumn\nAlpha\nBeta');
    results.push({ name: 'parseTable single column ok', pass: t4.rows.length === 3 && t4.rows[0].length === 1 });

    // NEW: mixed whitespace with pipes (robustness)
    const t5 = parseTable('A | B | C\n10 | 20 | 30', { delimiter: { rx: /\s*\|\s*/g } });
    results.push({ name: 'parseTable pipes with spaces', pass: t5.rows[1][1] === '20' });

    return results;
  } catch (e: any) {
    results.push({ name: 'harness crashed', pass: false, details: String(e?.message || e) });
    return results;
  }
}

// =====================
// OCR: Worker + Fallback
// =====================
const TESS_CDNS = [
  'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js',
  'https://unpkg.com/tesseract.js@4/dist/tesseract.min.js',
];

function createOcrWorker(): Worker {
  const workerCode = `
    const CDNS = ${JSON.stringify(TESS_CDNS)};
    let loaded = false;
    function tryLoad() {
      for (let i = 0; i < CDNS.length; i++) {
        try {
          importScripts(CDNS[i]);
          // @ts-ignore
          if (self.Tesseract && self.Tesseract.createWorker) { return true; }
        } catch (e) {
          // continue to next CDN
        }
      }
      return false;
    }

    self.onmessage = async (e) => {
      const { imageUrl, lang } = e.data || {};
      try {
        if (!loaded) loaded = tryLoad();
        if (!loaded) {
          self.postMessage({ type: 'error', message: 'Failed to fetch Tesseract script from CDNs (CSP/offline?).' });
          return;
        }
        // @ts-ignore - Tesseract is global (UMD)
        const { createWorker } = self.Tesseract;
        const worker = await createWorker({
          logger: (m) => {
            if (m && m.status === 'recognizing text' && m.progress != null) {
              self.postMessage({ type: 'progress', progress: Math.round(m.progress * 100) });
            }
          },
        });
        await worker.loadLanguage(lang || 'eng');
        await worker.initialize(lang || 'eng');
        const { data } = await worker.recognize(imageUrl);
        await worker.terminate();
        self.postMessage({ type: 'done', text: (data && data.text) ? data.text : '' });
      } catch (err) {
        const message = (err && err.message) ? err.message : String(err);
        self.postMessage({ type: 'error', message });
      }
    };
  `;
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  // @ts-ignore attach for cleanup
  (worker as any).__blobUrl = url;
  return worker;
}

function loadScriptUMD(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if ((window as any).Tesseract && (window as any).Tesseract.createWorker) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to fetch: ' + url));
    document.head.appendChild(s);
  });
}

async function runOcrInMain(imageUrl: string, lang: string, onProgress: (n: number) => void): Promise<string> {
  // Try CDNs sequentially WITHOUT dynamic import to avoid URL rewrite bugs
  let loaded = false;
  for (const src of TESS_CDNS) {
    try {
      await loadScriptUMD(src);
      loaded = true;
      break;
    } catch (_) { /* try next */ }
  }
  if (!loaded || !(window as any).Tesseract || !(window as any).Tesseract.createWorker) {
    throw new Error('Failed to fetch Tesseract (fallback). Check connection or CSP.');
  }
  const { createWorker } = (window as any).Tesseract;
  const worker = await createWorker({
    logger: (m: any) => {
      if (m && m.status === 'recognizing text' && m.progress != null) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });
  await worker.loadLanguage(lang || 'eng');
  await worker.initialize(lang || 'eng');
  const { data } = await worker.recognize(imageUrl);
  await worker.terminate();
  return (data && data.text) ? data.text : '';
}

export default function ScreenshotToCSV() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [isOcr, setIsOcr] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lang, setLang] = useState("eng");
  const [hasHeader, setHasHeader] = useState(true);
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [parsed, setParsed] = useState<{ rows: string[][]; modeCols: number }>({ rows: [], modeCols: 0 });
  const [error, setError] = useState("");
  const [showTests, setShowTests] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const ocrWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      if (ocrWorkerRef.current) {
        try {
          const url = (ocrWorkerRef.current as any).__blobUrl;
          ocrWorkerRef.current.terminate();
          if (url) URL.revokeObjectURL(url);
        } catch {}
      }
    };
  }, []);

  const lines = useMemo(() => smartSplitLines(ocrText), [ocrText]);
  const autoDelim = useMemo(() => guessDelimiter(lines), [lines]);
  const effectiveDelimiter = useMemo(() => {
    if (customDelimiter) {
      try {
        const rx = new RegExp(customDelimiter, "g");
        return { rx, label: `Custom /${customDelimiter}/` };
      } catch (_) {
        return autoDelim;
      }
    }
    return autoDelim;
  }, [customDelimiter, autoDelim]);

  const doParse = useCallback(() => {
    if (!ocrText.trim()) return;
    const out = parseTable(ocrText, { delimiter: effectiveDelimiter });
    setParsed(out);
  }, [ocrText, effectiveDelimiter]);

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setOcrText("");
    setParsed({ rows: [], modeCols: 0 });
    setError("");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  };

  const cleanupWorker = (worker: Worker | null) => {
    if (!worker) return;
    try {
      const url = (worker as any).__blobUrl;
      worker.terminate();
      if (url) URL.revokeObjectURL(url);
    } catch {}
  };

  const handleOcr = useCallback(async () => {
    if (!imageUrl || isOcr) return;
    setIsOcr(true);
    setProgress(0);
    setError("");

    if (ocrWorkerRef.current) {
      cleanupWorker(ocrWorkerRef.current);
      ocrWorkerRef.current = null;
    }

    const worker = createOcrWorker();
    ocrWorkerRef.current = worker;

    const finish = () => {
      setIsOcr(false);
      cleanupWorker(worker);
      ocrWorkerRef.current = null;
    };

    worker.onmessage = async (e: MessageEvent) => {
      const data: any = e.data || {};
      if (data.type === 'progress' && typeof data.progress === 'number') {
        setProgress(Math.max(0, Math.min(100, data.progress)));
      } else if (data.type === 'done') {
        setOcrText(String(data.text || ""));
        setProgress(100);
        finish();
      } else if (data.type === 'error') {
        // If the worker failed to fetch, fallback to main-thread OCR
        const msg = String(data.message || 'OCR error');
        if (/Failed to fetch|importScripts|CSP|offline/i.test(msg)) {
          try {
            const text = await runOcrInMain(imageUrl, lang, (n) => setProgress(n));
            setOcrText(text);
            setProgress(100);
          } catch (fallbackErr: any) {
            setError(String(fallbackErr?.message || fallbackErr));
          } finally {
            finish();
          }
        } else {
          setError(msg);
          finish();
        }
      }
    };

    worker.postMessage({ imageUrl, lang });
  }, [imageUrl, lang, isOcr]);

  const downloadCSV = () => {
    if (!parsed.rows.length) return;
    const rows = hasHeader ? parsed.rows : [[...Array(parsed.modeCols).keys()].map((i) => `Col ${i + 1}`), ...parsed.rows];
    const csv = rowsToCSV(rows as any);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const updateCell = (rIdx: number, cIdx: number, value: string) => {
    setParsed((p) => {
      const rows = p.rows.map((row, i) => (i === rIdx ? row.map((c, j) => (j === cIdx ? value : c)) : row));
      return { ...p, rows };
    });
  };

  const addCol = () => {
    setParsed((p) => ({ ...p, rows: p.rows.map((r) => [...r, ""]), modeCols: p.modeCols + 1 }));
  };
  const addRow = () => {
    setParsed((p) => ({ ...p, rows: [...p.rows, Array(p.modeCols || 1).fill("")] }));
  };

  const removeRow = (idx: number) => {
    setParsed((p) => ({ ...p, rows: p.rows.filter((_, i) => i !== idx) }));
  };

  const removeCol = (idx: number) => {
    setParsed((p) => ({
      ...p,
      rows: p.rows.map((r) => r.filter((_, i) => i !== idx)),
      modeCols: Math.max(0, p.modeCols - 1),
    }));
  };

  const unitResults = useMemo(() => runUnitTests(), []);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Screenshot → CSV Converter</h1>
        <div className="text-sm opacity-70">Tesseract.js in Worker with main-thread fallback (no dynamic import)</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload & OCR */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5"/>Upload Screenshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:bg-muted/50"
              onClick={() => fileRef.current?.click()}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="preview" className="max-h-80 mx-auto rounded-xl" />
              ) : (
                <div className="flex flex-col items-center gap-2 py-10">
                  <Upload className="h-8 w-8"/>
                  <p className="text-sm">Drag & drop an image or click to select</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label>OCR language</Label>
                <Input value={lang} onChange={(e) => setLang(e.target.value)} placeholder="eng" />
                <p className="text-xs text-muted-foreground">e.g., eng, spa, deu (ISO 639-2)</p>
              </div>
              <div className="space-y-2">
                <Label>Has header row</Label>
                <div className="flex items-center gap-2 h-10"><Switch checked={hasHeader} onCheckedChange={setHasHeader}/><span className="text-sm">{hasHeader ? "Yes" : "No"}</span></div>
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label>Custom delimiter (regex)</Label>
                <Input value={customDelimiter} onChange={(e) => setCustomDelimiter(e.target.value)} placeholder={"leave blank for auto"} />
              </div>
              <div className="md:col-span-3 flex items-center gap-3">
                <Button onClick={handleOcr} disabled={!imageUrl || isOcr}>
                  {isOcr ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Wand2 className="h-4 w-4 mr-2"/>}
                  Run OCR
                </Button>
                <Button variant="secondary" onClick={doParse} disabled={!ocrText.trim()}>Parse to Table</Button>
              </div>
            </div>

            {isOcr && (
              <div className="space-y-2">
                <Label>OCR progress</Label>
                <Progress value={progress} />
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="space-y-2">
              <Label>Recognized text</Label>
              <textarea
                className="w-full h-40 rounded-xl border p-3 font-mono text-sm"
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="OCR output will appear here. You can edit it before parsing."
              />
              {ocrText && (
                <p className="text-xs text-muted-foreground">Auto delimiter guess: <strong>{autoDelim?.label}</strong></p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Table & Export */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5"/>Parsed Table & Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsed.rows.length ? (
              <>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" onClick={addRow} variant="secondary">+ Row</Button>
                  <Button size="sm" onClick={addCol} variant="secondary">+ Column</Button>
                  <Button size="sm" onClick={downloadCSV}><Download className="h-4 w-4 mr-2"/>Download CSV</Button>
                </div>

                <div className="overflow-auto border rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted">
                        {Array.from({ length: parsed.rows[0].length }).map((_, c) => (
                          <th key={c} className="px-2 py-2 text-left font-semibold align-middle">
                            {hasHeader ? (
                              <input
                                value={parsed.rows[0][c] || ""}
                                onChange={(e) => updateCell(0, c, e.target.value)}
                                className="w-full bg-transparent border rounded px-2 py-1"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>Col {c + 1}</span>
                                <Button size="icon" variant="ghost" title="Remove column" onClick={() => removeCol(c)}>×</Button>
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.rows.slice(hasHeader ? 1 : 0).map((row, rIdx) => (
                        <tr key={rIdx} className="odd:bg-background even:bg-muted/30">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-2 py-1 align-top">
                              <input
                                value={cell}
                                onChange={(e) => updateCell((hasHeader ? rIdx + 1 : rIdx), cIdx, e.target.value)}
                                className="w-full bg-transparent border rounded px-2 py-1"
                              />
                            </td>
                          ))}
                          <td className="px-2 py-1 text-right">
                            <Button size="sm" variant="ghost" onClick={() => removeRow((hasHeader ? rIdx + 1 : rIdx))}>Remove</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-xs text-muted-foreground">
                  Tip: If columns look merged, try setting a custom delimiter regex like <code>\n</code> for lines or <code>{'\\s{2,}'}</code> for multi-spaces, then hit <b>Parse to Table</b> again.
                </div>
              </>
            ) : (
              <div className="text-sm opacity-70">
                No table parsed yet. Run OCR, optionally edit the text, then click <b>Parse to Table</b>.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to get best results</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <ul className="list-disc pl-5 space-y-1">
            <li>Use high-contrast screenshots with the table tightly cropped.</li>
            <li>For clean splits, favor monospace tables or those with tab/pipe separators.</li>
            <li>If a column is inconsistent, add a delimiter regex (e.g., <code>\t+</code>, <code>\s*\|\s*</code>, <code>{'\\s{2,}'}</code>).</li>
            <li>Manually tweak cells in the grid, then export to CSV.</li>
            <li>Language packs: set <code>OCR language</code> to the closest match (e.g., <code>eng</code>).</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unit tests</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setShowTests((s) => !s)}>{showTests ? 'Hide' : 'Show'} results</Button>
          </div>
          {showTests && (
            <div className="overflow-auto border rounded-xl p-3 font-mono text-xs">
              {unitResults.map((r, i) => (
                <div key={i} className={r.pass ? 'text-green-600' : 'text-red-600'}>
                  {r.pass ? '✔' : '✘'} {r.name}{r.details ? ` — ${r.details}` : ''}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
