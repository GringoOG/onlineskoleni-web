"use client";

import JSZip from "jszip";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function triggerBlobDownload(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingFailed, setDeletingFailed] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const workerRef = useRef(false);

  const pendingCount = useMemo(
    () => images.filter((image) => image.status === "PENDING").length,
    [images]
  );

  const processingCount = useMemo(
    () => images.filter((image) => image.status === "PROCESSING").length,
    [images]
  );

  const failedCount = useMemo(
    () => images.filter((image) => image.status === "FAILED").length,
    [images]
  );

  const completedImages = useMemo(
    () => images.filter((image) => image.status === "COMPLETED" && image.imageUrl),
    [images]
  );

  const completedCount = completedImages.length;

  const activeCount = pendingCount + processingCount;

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

  const nudgeQueueProcessing = useCallback(async () => {
    const response = await fetch("/api/admin/generator/process", {
      method: "POST",
      credentials: "same-origin",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error ?? "Generování se nepodařilo spustit.");
    }
    return data;
  }, []);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  useEffect(() => {
    if (activeCount === 0) {
      return;
    }

    async function runWorker() {
      if (workerRef.current) {
        return;
      }

      workerRef.current = true;
      try {
        await nudgeQueueProcessing();
        await loadImages();
      } catch (queueError) {
        setError(
          queueError instanceof Error
            ? queueError.message
            : "Fronta generování se nespustila."
        );
      } finally {
        workerRef.current = false;
      }
    }

    void runWorker();
    const interval = window.setInterval(() => {
      void runWorker();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeCount, loadImages, nudgeQueueProcessing]);

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
      if (data.queued > 0) {
        try {
          await nudgeQueueProcessing();
          await loadImages();
        } catch (queueError) {
          setError(
            queueError instanceof Error
              ? queueError.message
              : "Prompty jsou ve frontě, ale generování se nepodařilo spustit."
          );
        }
      }
    } catch {
      setError("Chyba spojení. Zkuste to prosím znovu.");
    } finally {
      setLoading(false);
    }
  }

  async function retryFailed() {
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/generator/retry", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Opakování se nezdařilo.");
      }
      setSuccess(`Znovu zařazeno ${data.retried} chybných položek.`);
      await loadImages();
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : "Opakování se nezdařilo.");
    }
  }

  async function deleteFailed() {
    if (!window.confirm(`Opravdu smazat všech ${failedCount} chybných položek?`)) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingFailed(true);
    try {
      const response = await fetch("/api/admin/generator/delete-failed", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Mazání se nezdařilo.");
      }
      setSuccess(`Smazáno ${data.deleted} chybných položek.`);
      await loadImages();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Mazání se nezdařilo.");
    } finally {
      setDeletingFailed(false);
    }
  }

  async function deleteImage(image: GeneratedImageRecord) {
    if (
      !window.confirm(
        `Opravdu smazat položku ${image.fileName}?${
          image.status === "PENDING" ? " Bude odstraněna z fronty." : ""
        }`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(image.id);
    try {
      const response = await fetch(`/api/admin/generator/${image.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Mazání se nezdařilo.");
      }
      setSuccess(`Položka ${image.fileName} byla smazána.`);
      await loadImages();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Mazání se nezdařilo.");
    } finally {
      setDeletingId(null);
    }
  }

  async function downloadAllCompleted() {
    if (completedCount === 0) {
      return;
    }

    setError("");
    setSuccess("");
    setDownloadingAll(true);

    try {
      const zip = new JSZip();

      for (const image of completedImages) {
        const response = await fetch(`/api/admin/generator/download?id=${encodeURIComponent(image.id)}`);
        if (!response.ok) {
          throw new Error(`Nepodařilo se stáhnout ${image.fileName}.png.`);
        }
        const blob = await response.blob();
        zip.file(`${image.fileName}.png`, blob);
      }

      const archive = await zip.generateAsync({ type: "blob" });
      const stamp = new Date().toISOString().slice(0, 10);
      triggerBlobDownload(archive, `ilustrace-hotovo-${stamp}.zip`);
      setSuccess(`Stažen archiv se ${completedCount} obrázky.`);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error ? downloadError.message : "Hromadné stažení se nezdařilo."
      );
    } finally {
      setDownloadingAll(false);
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
          {failedCount > 0 ? (
            <>
              <button
                type="button"
                onClick={() => void retryFailed()}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
              >
                Opakovat chybné ({failedCount})
              </button>
              <button
                type="button"
                onClick={() => void deleteFailed()}
                disabled={deletingFailed}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {deletingFailed ? "Mažu…" : `Smazat chybné (${failedCount})`}
              </button>
            </>
          ) : null}
          {activeCount > 0 ? (
            <span className="text-sm text-amber-800">
              {processingCount > 0
                ? `Generuje se ${processingCount} obrázek${processingCount > 1 ? "ů" : ""}, ve frontě ${pendingCount}`
                : `Ve frontě ${pendingCount} – spouštím generování…`}
              {" · "}
              Fronta běží i na pozadí (cron každou minutu).
            </span>
          ) : null}
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Vygenerované obrázky</h2>
          <div className="flex flex-wrap items-center gap-3">
            {completedCount > 0 ? (
              <button
                type="button"
                onClick={() => void downloadAllCompleted()}
                disabled={downloadingAll}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100 disabled:opacity-60"
              >
                {downloadingAll
                  ? `Připravuji ZIP (${completedCount})…`
                  : `Stáhnout vše hotové (${completedCount})`}
              </button>
            ) : null}
            <span className="text-sm text-slate-500">{images.length} záznamů</span>
          </div>
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
                      {image.status === "FAILED" && image.errorMessage ? (
                        <p className="mt-1 max-w-xs text-xs text-red-700">{image.errorMessage}</p>
                      ) : null}
                    </td>
                    <td className="max-w-md px-4 py-3 text-xs leading-relaxed text-slate-600">
                      <span className="line-clamp-3">{image.prompt}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
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
                        ) : null}
                        {image.status === "FAILED" || image.status === "PENDING" ? (
                          <button
                            type="button"
                            onClick={() => void deleteImage(image)}
                            disabled={deletingId === image.id}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-50 disabled:opacity-60"
                          >
                            {deletingId === image.id ? "Mažu…" : "Smazat"}
                          </button>
                        ) : null}
                        {image.status === "PROCESSING" ? (
                          <span className="text-xs text-slate-400">Probíhá…</span>
                        ) : null}
                      </div>
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
