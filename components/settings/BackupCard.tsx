"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BackupCard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function exportData() {
    setLoading(true);
    setMessage("");

    try {
      const { data: trades } = await supabase
        .from("trades")
        .select("*");

      const { data: executions } = await supabase
        .from("executions")
        .select("*");

      const { data: settings } = await supabase
        .from("app_settings")
        .select("*");

      const backup = {
        version: "SPCXX_BACKUP_V2",
        exported_at: new Date().toISOString(),
        settings: settings || [],
        trades: trades || [],
        executions: executions || [],
      };

      const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        {
          type: "application/json",
        }
      );

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;

      a.download = `spcxx-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      a.click();

      URL.revokeObjectURL(url);

      setMessage("备份导出成功");
    } catch (err: any) {
      setMessage(err.message);
    }

    setLoading(false);
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <h2 className="text-2xl font-extrabold mb-5">
        📦 数据备份
      </h2>

      <p className="text-gray-600 mb-5">
        导出设置、订单、成交记录。
      </p>

      {message && (
        <div className="mb-4 rounded-xl bg-green-50 p-3 font-bold text-green-700">
          {message}
        </div>
      )}

      <button
        onClick={exportData}
        disabled={loading}
        className="w-full rounded-xl bg-green-600 py-4 text-lg font-extrabold text-white"
      >
        {loading ? "导出中..." : "导出备份"}
      </button>
    </div>
  );
}