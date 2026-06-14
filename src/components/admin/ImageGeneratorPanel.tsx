"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GeneratedImageRecord, GeneratedImageStatus } from "@/lib/admin/image-generator/types";

const inputClassName =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";

const EXAMPLE_LINE =
  'q1 | A premium, modern 2D vector illustration for a corporate microlearning app. Clean flat design... --ar 4:3';

function statusLabel(status: GeneratedImageStatus): string {
  switch (status) {
    case "PENDING":
      return "Ve frontě";
    case "PROCESSING":
      return "Generuje se";
    case "COMPLETED":
      return "Hotovo";
    case "FAILED":
      return "Chyba";
    default:
      return status;
  }
}

function statusClassName(status: GeneratedImageStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "PROCESSING":
      return "bg-amber-50 text-amber-900 border-amber-200";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-900 border-emerald-200";
    case "FAILED":
      return "bg-red-50 text-red-900 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

async function downloadImage(imageId: string, fileName: string) {
  const response = await fetch(`/api/admin/generator/download?id=${encodeURIComponent(imageId)}`);
  if (!response.ok) {
    throw new Error("Nepodařilo se stáhnout obrázek.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = `${fileName}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export function ImageGeneratorPanel() {
  const [rawInput, setRawInput] = useState("");
  const [images, setImages] = useState<GeneratedImageRecord[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const activeCount = useMemo(
    () => images.filter((image) => image.status === "PENDING" || image.status === "PROCESSING").length,
    [images]
  );

  const loadImages = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/generator", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Nepodařilo se načíst stav generování.");
      }
      setImages(data.images ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Chyba načítání.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  useEffect(() => {
    if (activeCount === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      void loadImages();
    }, 4000);

    return () => window.clearInterval(interval);
  }, [activeCount, loadImages]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Generování se nepodařilo spustit.");
        return;
      }

      setSuccess(`Do fronty bylo zařazeno ${data.queued} promptů.`);
      setRawInput("");
      await loadImages();
    } catch {
      setError("Chyba spojení. Zkuste to prosím znovu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rawInput" className="block text-sm font-medium text-slate-700">
            Prompty pro hromadné generování
          </label>
          <p className="mt-1 text-sm text-slate-500">
            Jeden řádek = jeden obrázek. Formát:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">KÓD_OTÁZKY | CELÝ_PROMPT</code>{" "}
            (max. 200 řádků).
          </p>
          <textarea
            id="rawInput"
            rows={14}
            value={rawInput}
            onChange={(event) => setRawInput(event.target.value)}
            placeholder={`${EXAMPLE_LINE}\nq2 | Další prompt...`}
            className={`${inputClassName} font-mono text-xs leading-relaxed`}
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            {success}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={loading || !rawInput.trim()} className="btn-primary">
            {loading ? "Zařazuji do fronty…" : "Spustit hromadné generování"}
          </button>
          <button
            type="button"
            onClick={() => void loadImages()}
            disabled={refreshing}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {refreshing ? "Obnovuji…" : "Obnovit stav"}
          </button>
          {activeCount > 0 ? (
            <span className="text-sm text-amber-800">
              Probíhá generování ({activeCount} ve frontě / zpracovává se)
            </span>
          ) : null}
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Vygenerované obrázky</h2>
          <span className="text-sm text-slate-500">{images.length} záznamů</span>
        </div>

        {images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Zatím nejsou žádné záznamy. Vložte prompty a spusťte generování.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Náhled</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Kód</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Stav</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Prompt</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {images.map((image) => (
                  <tr key={image.id} className="align-top">
                    <td className="px-4 py-3">
                      {image.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.imageUrl}
                          alt={image.fileName}
                          className="h-16 w-24 rounded-lg border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
                          {image.status === "PROCESSING" ? "…" : "—"}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900">
                      {image.fileName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClassName(image.status)}`}
                      >
                        {statusLabel(image.status)}
                      </span>
                    </td>
                    <td className="max-w-md px-4 py-3 text-xs leading-relaxed text-slate-600">
                      <span className="line-clamp-3">{image.prompt}</span>
                    </td>
                    <td className="px-4 py-3">
                      {image.status === "COMPLETED" && image.imageUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            downloadImage(image.id, image.fileName).catch(() =>
                              setError("Stažení obrázku se nezdařilo.")
                            )
                          }
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Stáhnout {image.fileName}.png
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
