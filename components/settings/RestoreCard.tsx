"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RestoreCard() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function importData(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const first = window.confirm("确定要还原备份吗？当前数据会被清空。");
    if (!first) return;

    const second = window.confirm("再次确认：还原前会删除当前所有数据。是否继续？");
    if (!second) return;

    setLoading(true);
    setMessage("");

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (
        backup.version !== "SPCXX_BACKUP_V1" &&
        backup.version !== "SPCXX_BACKUP_V2"
      ) {
        throw new Error("备份文件格式不正确");
      }

      await supabase.from("executions").delete().neq("id", 0);
      await supabase.from("trades").delete().neq("id", 0);

      if (backup.version === "SPCXX_BACKUP_V2" && backup.settings?.length > 0) {
        await supabase.from("app_settings").delete().neq("id", 0);

        const { error } = await supabase
          .from("app_settings")
          .insert(backup.settings);

        if (error) throw error;
      }

      if (backup.trades?.length > 0) {
        const { error } = await supabase.from("trades").insert(backup.trades);
        if (error) throw error;
      }

      if (backup.executions?.length > 0) {
        const { error } = await supabase
          .from("executions")
          .insert(backup.executions);

        if (error) throw error;
      }

      setMessage("数据还原成功");
    } catch (err: any) {
      setMessage("还原失败：" + err.message);
    }

    if (fileRef.current) {
      fileRef.current.value = "";
    }

    setLoading(false);
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <h2 className="mb-5 text-2xl font-extrabold">♻️ 数据还原</h2>

      <p className="mb-5 text-gray-600">
        从备份文件恢复设置、订单和成交记录。
      </p>

      {message && (
        <div className="mb-4 rounded-xl bg-blue-50 p-3 font-bold text-blue-700">
          {message}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        onChange={importData}
        disabled={loading}
        className="w-full rounded-xl border border-gray-300 bg-white p-4 text-base font-bold"
      />
    </div>
  );
}