"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Upload,
  TrendingUp,
  TrendingDown,
  Star,
  Shield,
  MessageSquare,
  AlertCircle,
  Bell,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  type: "coa_verified" | "coa_uploaded" | "score_up" | "score_down" | "review" | "verified" | "mention" | "alert";
  title: string;
  description: string;
  time: string;
}

const typeConfig = {
  coa_verified: { icon: CheckCircle2, color: "text-emerald", bg: "bg-emerald/10" },
  coa_uploaded: { icon: Upload, color: "text-blue-400", bg: "bg-blue-500/10" },
  score_up: { icon: TrendingUp, color: "text-emerald", bg: "bg-emerald/10" },
  score_down: { icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/10" },
  review: { icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  verified: { icon: Shield, color: "text-emerald", bg: "bg-emerald/10" },
  mention: { icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10" },
  alert: { icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-500/10" },
};

interface ActivityFeedProps {
  items: ActivityItem[];
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item, i) => {
        const config = typeConfig[item.type];
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-ink-3/50 transition-colors group"
          >
            <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <config.icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">{item.title}</p>
              <p className="text-xs text-gray-500 truncate">{item.description}</p>
            </div>
            <span className="text-xs text-gray-600 flex-shrink-0 mt-1">{item.time}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
