"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileCheck,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  File,
  Trash2,
} from "lucide-react";

interface UploadCOAModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (coa: { peptideName: string; batchId: string; fileName: string }) => void;
}

export default function UploadCOAModal({ open, onClose, onUpload }: UploadCOAModalProps) {
  const [peptideName, setPeptideName] = useState("");
  const [batchId, setBatchId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setPeptideName("");
    setBatchId("");
    setFile(null);
    setSuccess(false);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type === "application/pdf" || f.name.endsWith(".pdf"))) {
      setFile(f);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !peptideName || !batchId) return;
    setUploading(true);

    // Simulate upload — replace with real Supabase storage upload
    await new Promise((r) => setTimeout(r, 1500));

    onUpload({ peptideName, batchId, fileName: file.name });
    setSuccess(true);
    setUploading(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { resetForm(); onClose(); }}
          className="absolute inset-0 bg-black/80 modal-overlay"
        />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-ink-2 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
        >
          <div className="p-6 pb-4 border-b border-white/5">
            <button
              onClick={() => { resetForm(); onClose(); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
                <Upload className="w-5 h-5 text-emerald" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-white">Upload COA</h2>
                <p className="text-sm text-gray-500">Add a certificate of analysis for verification</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <CheckCircle2 className="w-8 h-8 text-emerald" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">COA Uploaded</h3>
                <p className="text-sm text-gray-400 mb-1">
                  <strong className="text-emerald">{peptideName}</strong> — Batch {batchId}
                </p>
                <p className="text-xs text-gray-500 mb-6">
                  Verification typically completes within 24-48 hours.
                </p>
                <button
                  onClick={() => { resetForm(); onClose(); }}
                  className="px-6 py-2.5 bg-emerald/10 border border-emerald/20 text-emerald rounded-lg hover:bg-emerald/20 transition-all"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Peptide Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={peptideName}
                    onChange={(e) => setPeptideName(e.target.value)}
                    placeholder="e.g. BPC-157, Semaglutide"
                    className="w-full px-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Batch ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    placeholder="e.g. BPC-2024-0412"
                    className="w-full px-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                  />
                </div>

                {/* File drop zone */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    COA Document (PDF) <span className="text-red-400">*</span>
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dragOver
                        ? "border-emerald bg-emerald/5"
                        : file
                        ? "border-emerald/30 bg-emerald/5"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <File className="w-5 h-5 text-emerald" />
                        <span className="text-sm text-white">{file.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">
                          Drop your PDF here or <span className="text-emerald">browse</span>
                        </p>
                        <p className="text-xs text-gray-600 mt-1">PDF only, max 10MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-400/80">
                    COAs are verified against lab databases. Fraudulent documents will result in immediate delisting.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !file || !peptideName || !batchId}
                  className="btn-glow w-full py-3.5 bg-emerald text-white font-semibold rounded-lg hover:bg-emerald-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-5 h-5" />
                      Upload for Verification
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
