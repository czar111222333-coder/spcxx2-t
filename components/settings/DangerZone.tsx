"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DangerZone() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function clearAllData() {
    const first = window.confirm("确定要清空全部交易数据吗？这个操作不能撤销。");
    if (!first) return;

    const second = window.confirm(
      "再次确认：将删除所有做T订单和成交记录，但会保留系统设置。是否继续？"
    );
    if (!second) return;

    setLoading(true);
    setMessage("");

    try {
      const { error: executionError } = await supabase
        .from("executions")
        .delete()
        .neq("id", 0);

      if (executionError) throw executionError;

      const { error: tradeError } = await supabase
        .from("trades")
        .delete()
        .neq("id", 0);

      if (tradeError) throw tradeError;

      setMessage("全部交易数据已清空");
    } catch (err: any) {
      setMessage("清空失败：" + err.message);
    }

    setLoading(false);
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <h2 className="mb-5 text-2xl font-extrabold text-red-600">
        危险操作
      </h2>

      <p className="mb-5 text-gray-600">
        清空所有做T订单和成交记录。系统设置会保留。
      </p>

      {message && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 font-bold text-red-700">
          {message}
        </div>
      )}

      <button
        onClick={clearAllData}
        disabled={loading}
        className="w-full rounded-xl bg-red-600 py-4 text-lg font-extrabold text-white"
      >
        {loading ? "清空中..." : "清空全部交易数据"}
      </button>
    </div>
  );
}