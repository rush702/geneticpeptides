"use server";

import { createClient } from "@/lib/supabase/server";

const BUCKET = "coa-documents";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function uploadCOA(formData: FormData): Promise<{
  ok: boolean;
  coa?: {
    id: string;
    peptideName: string;
    batchId: string;
    fileName: string;
    status: "pending";
    uploadedAt: string;
  };
  error?: string;
}> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Authentication required." };

  // Get profile for foreign key
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, vendor_name")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { ok: false, error: "No vendor profile found. Please claim your listing first." };

  const peptideName = formData.get("peptideName") as string;
  const batchId = formData.get("batchId") as string;
  const file = formData.get("file") as File | null;

  if (!peptideName || !batchId) return { ok: false, error: "Peptide name and batch ID are required." };
  if (!file) return { ok: false, error: "No file provided." };
  if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
    return { ok: false, error: "Only PDF files are accepted." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "File exceeds 10 MB limit." };
  }

  // Build a unique storage path: user_id/timestamp-batchid.pdf
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const storagePath = `${user.id}/${Date.now()}-${safeFileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    console.error("[COA] Storage upload failed:", uploadError);
    return { ok: false, error: "File upload failed. Please try again." };
  }

  // Insert metadata record
  const { data: coaRow, error: insertError } = await supabase
    .from("coa_uploads")
    .insert({
      profile_id: profile.id,
      user_id: user.id,
      peptide_name: peptideName,
      batch_id: batchId,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      status: "pending",
    })
    .select("id, uploaded_at")
    .single();

  if (insertError) {
    console.error("[COA] DB insert failed:", insertError);
    // Clean up the uploaded file to avoid orphans
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return { ok: false, error: "Failed to save COA record." };
  }

  return {
    ok: true,
    coa: {
      id: coaRow.id,
      peptideName,
      batchId,
      fileName: file.name,
      status: "pending",
      uploadedAt: new Date(coaRow.uploaded_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    },
  };
}

export async function getMyCOAs(): Promise<{
  id: string;
  peptideName: string;
  batchId: string;
  fileName: string;
  status: "pending" | "verified" | "rejected";
  purity?: string;
  uploadedAt: string;
  verifiedAt?: string;
}[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("coa_uploads")
    .select("id, peptide_name, batch_id, file_name, status, purity, uploaded_at, verified_at")
    .eq("user_id", user.id)
    .order("uploaded_at", { ascending: false })
    .limit(50);

  if (error) {
    console.warn("[COA] getMyCOAs query failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    peptideName: row.peptide_name,
    batchId: row.batch_id,
    fileName: row.file_name,
    status: row.status,
    purity: row.purity ?? undefined,
    uploadedAt: new Date(row.uploaded_at).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }),
    verifiedAt: row.verified_at
      ? new Date(row.verified_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })
      : undefined,
  }));
}
