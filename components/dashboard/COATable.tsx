"use client";

import { motion } from "framer-motion";
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  FlaskConical,
} from "lucide-react";

export interface COARecord {
  id: string;
  peptideName: string;
  batchId: string;
  fileName: string;
  status: "verified" | "pending" | "rejected";
  purity?: string;
  uploadedAt: string;
  verifiedAt?: string;
}

const statusConfig = {
  verified: {
    icon: CheckCircle2,
    label: "Verified",
    color: "text-emerald",
    bg: "bg-emerald/10 border-emerald/20",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
};

interface COATableProps {
  coas: COARecord[];
}

export default function COATable({ coas }: COATableProps) {
  if (coas.length === 0) {
    return (
      <div className="text-center py-12">
        <FlaskConical className="w-10 h-10 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 mb-1">No COAs uploaded yet</p>
        <p className="text-sm text-gray-600">
          Upload your first certificate of analysis to start building your verification profile.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Desktop table */}
      <table className="w-full hidden md:table">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
              Peptide
            </th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
              Batch ID
            </th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
              Status
            </th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
              Purity
            </th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
              Uploaded
            </th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
              File
            </th>
          </tr>
        </thead>
        <tbody>
          {coas.map((coa, i) => {
            const st = statusConfig[coa.status];
            return (
              <motion.tr
                key={coa.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-white/5 hover:bg-ink-3/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald" />
                    <span className="text-sm text-white font-medium">{coa.peptideName}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-400 font-mono">{coa.batchId}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${st.bg} ${st.color}`}>
                    <st.icon className="w-3 h-3" />
                    {st.label}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-white">
                    {coa.purity || "—"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-500">{coa.uploadedAt}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-gray-500 hover:text-emerald transition-colors inline-flex items-center gap-1 text-sm">
                    {coa.fileName}
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {coas.map((coa, i) => {
          const st = statusConfig[coa.status];
          return (
            <motion.div
              key={coa.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 bg-ink border border-white/5 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald" />
                  <span className="text-sm text-white font-medium">{coa.peptideName}</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${st.bg} ${st.color}`}>
                  <st.icon className="w-3 h-3" />
                  {st.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Batch:</span>{" "}
                  <span className="text-gray-300 font-mono">{coa.batchId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Purity:</span>{" "}
                  <span className="text-gray-300">{coa.purity || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Uploaded:</span>{" "}
                  <span className="text-gray-300">{coa.uploadedAt}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
