"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { staffDocuments } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  FileText, Upload, Download, Trash2, Loader2,
  File, FileImage, FileArchive, Eye, X,
} from "lucide-react";

const DOCUMENT_TYPES = [
  { value: "cv", label: "Currículum Vitae" },
  { value: "id", label: "Cédula / Identificación" },
  { value: "certificate", label: "Certificado / Curso" },
  { value: "contract", label: "Contrato" },
  { value: "photo", label: "Foto" },
  { value: "other", label: "Otro" },
];

const TYPE_ICONS = {
  cv: FileText,
  id: File,
  certificate: FileArchive,
  contract: FileText,
  photo: FileImage,
  other: File,
};

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AuthThumbnail({ url, alt }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!res.ok) return;
        const blob = await res.blob();
        if (!cancelled) setSrc(URL.createObjectURL(blob));
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [url]);
  if (!src) return null;
  return <img src={src} alt={alt} className="h-8 w-8 rounded object-cover border" />;
}

export function EmployeeDocuments({ employee, open, onClose }) {
  const { user } = useAuth();
  const canWrite = user?.role === "admin" || user?.role === 1 || user?.permissions?.includes("*") || user?.permissions?.includes("staff:write");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [uploadData, setUploadData] = useState({
    document_type: "other",
    notes: "",
    file: null,
  });

  const isImageFile = (file) => file?.type?.startsWith("image/");
  const isPdfFile = (file) => file?.type === "application/pdf";

  const generatePreview = (file) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) { setPreviewUrl(null); return; }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const isImageMime = (mime) => mime?.startsWith("image/");

  const loadPreview = async (url) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Error cargando preview");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPreviewDoc(objectUrl);
    } catch {
      toast.error("No se pudo cargar la vista previa");
    }
  };

  const loadDocuments = useCallback(async () => {
    if (!employee?.id_staff) return;
    setLoading(true);
    try {
      const res = await staffDocuments.getAll(employee.id_staff);
      setDocuments(res.data || []);
    } catch (err) {
      toast.error("Error cargando documentos");
    } finally {
      setLoading(false);
    }
  }, [employee?.id_staff]);

  useEffect(() => {
    if (open) {
      loadDocuments();
      setShowUpload(false);
      setUploadData({ document_type: "other", notes: "", file: null });
    }
  }, [open, loadDocuments]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("document_type", uploadData.document_type);
      if (uploadData.notes) formData.append("notes", uploadData.notes);
      await staffDocuments.upload(employee.id_staff, formData);
      await loadDocuments();
      setShowUpload(false);
      setUploadData({ document_type: "other", notes: "", file: null });
      toast.success("Documento subido correctamente");
    } catch (err) {
      toast.error(err?.message || "Error subiendo documento");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    try {
      await staffDocuments.delete(employee.id_staff, doc.id_document);
      await loadDocuments();
      toast.success("Documento eliminado");
    } catch (err) {
      toast.error(err?.message || "Error eliminando documento");
    }
  };

  const handleDownload = (doc) => {
    const url = staffDocuments.getDownloadUrl(employee.id_staff, doc.id_document);
    window.open(url, "_blank");
  };

  const closePreview = () => {
    if (previewDoc) URL.revokeObjectURL(previewDoc);
    setPreviewDoc(null);
  };

  if (!employee) return null;

  return (
    <><Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Documentos — {employee?.name} {employee?.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {canWrite && !showUpload && (
            <Button onClick={() => setShowUpload(true)} variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Subir documento
            </Button>
          )}

          {showUpload && (
            <form onSubmit={handleUpload} className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="doc-file">Archivo *</Label>
                <Input
                  id="doc-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setUploadData((c) => ({ ...c, file }));
                    generatePreview(file);
                  }}
                />
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC, DOCX — Máx 10MB</p>
              </div>

              {previewUrl && (
                <div className="border rounded-lg overflow-hidden bg-background">
                  {isImageFile(uploadData.file) ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Vista previa"
                        className="max-h-48 w-full object-contain bg-muted/30"
                      />
                      <button
                        type="button"
                        onClick={() => { setPreviewUrl(null); setUploadData((c) => ({ ...c, file: null })); document.getElementById("doc-file").value = ""; }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background shadow-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : isPdfFile(uploadData.file) ? (
                    <div className="relative">
                      <iframe
                        src={previewUrl}
                        className="w-full h-48 bg-muted/30"
                        title="Vista previa PDF"
                      />
                      <button
                        type="button"
                        onClick={() => { setPreviewUrl(null); setUploadData((c) => ({ ...c, file: null })); document.getElementById("doc-file").value = ""; }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background shadow-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <span>Vista previa no disponible para este formato</span>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="doc-type">Tipo de documento *</Label>
                <Select value={uploadData.document_type} onValueChange={(v) => setUploadData((c) => ({ ...c, document_type: v }))}>
                  <SelectTrigger id="doc-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((dt) => (
                      <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-notes">Notas (opcional)</Label>
                <Textarea
                  id="doc-notes"
                  value={uploadData.notes}
                  onChange={(e) => setUploadData((c) => ({ ...c, notes: e.target.value }))}
                  placeholder="Descripción del documento..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={uploading || !uploadData.file}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {uploading ? "Subiendo..." : "Subir"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowUpload(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay documentos para este empleado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Archivo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tamaño</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Subido</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {documents.map((doc) => {
                    const Icon = TYPE_ICONS[doc.document_type] || File;
                    const typeLabel = DOCUMENT_TYPES.find((t) => t.value === doc.document_type)?.label || doc.document_type;
                    const docIsImage = isImageMime(doc.mime_type);
                    const docUrl = staffDocuments.getDownloadUrl(employee.id_staff, doc.id_document);
                    return (
                      <tr key={doc.id_document} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center gap-2">
                            {docIsImage ? (
                              <AuthThumbnail url={docUrl} alt={doc.file_name} />
                            ) : (
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            )}
                            {typeLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{doc.file_name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatSize(doc.file_size)}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(doc.uploaded_at)}</td>
                        <td className="px-4 py-3 text-right space-x-1 flex justify-end">
                          {docIsImage ? (
                            <Button variant="ghost" size="sm" onClick={() => loadPreview(docUrl)} title="Vista previa">
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)} title="Descargar">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {canWrite && (
                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(doc)} title="Eliminar">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose()}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

      {previewDoc && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80" onClick={closePreview}>
          <div className="relative max-w-3xl max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closePreview}
              className="absolute -top-3 -right-3 p-1.5 rounded-full bg-background shadow-md hover:bg-muted transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={previewDoc} alt="Vista previa" className="max-h-[85vh] w-auto rounded-lg shadow-xl" />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}