"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import Card from "@/components/Card";

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function exportData() {
    setLoading(true);
    setMessage("");

    const { data: trades } = await supabase.from("trades").select("*");
    const { data: executions } = await supabase.from("executions").select("*");

    const backup = {
      version: "SPCXX_BACKUP_V1",
      exported_at: new Date().toISOString(),
      trades: trades || [],
      executions: executions || [],
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `spcxx-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();

    URL.revokeObjectURL(url);

    setMessage("数据备份已导出");
    setLoading(false);
  }

  async function clearAllData() {
    const first = window.confirm("确定要清空全部数据吗？这个操作不能撤销。");
    if (!first) return;

    const second = window.confirm("再次确认：将删除所有做T订单和完成记录。是否继续？");
    if (!second) return;

    setLoading(true);
    setMessage("");

    await supabase.from("executions").delete().neq("id", 0);
    await supabase.from("trades").delete().neq("id", 0);

    setMessage("全部数据已清空");
    setLoading(false);
  }

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

      if (backup.version !== "SPCXX_BACKUP_V1") {
        setMessage("备份文件格式不正确");
        setLoading(false);
        return;
      }

      await supabase.from("executions").delete().neq("id", 0);
      await supabase.from("trades").delete().neq("id", 0);

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

      setMessage("数据还原完成");
    } catch (error: any) {
      setMessage("还原失败：" + error.message);
    }

    if (fileRef.current) {
      fileRef.current.value = "";
    }

    setLoading(false);
  }

  return (
    <PageContainer>
      <PageTitle title="数据管理" subtitle="备份、还原和清空 SPCXX 数据" />

      <div className="space-y-5">
        {message && (
          <div className="rounded-xl bg-blue-50 p-4 text-base font-bold text-blue-700">
            {message}
          </div>
        )}

        <Card>
          <h3 className="text-xl font-extrabold text-gray-950">导出备份</h3>
          <p className="mt-2 text-base font-medium text-gray-600">
            将所有做T订单和完成记录导出为 JSON 文件。
          </p>

          <button
            onClick={exportData}
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-green-600 py-4 text-lg font-extrabold text-white"
          >
            导出数据备份
          </button>
        </Card>

        <Card>
          <h3 className="text-xl font-extrabold text-gray-950">还原数据</h3>
          <p className="mt-2 text-base font-medium text-gray-600">
            从备份文件还原数据。还原前会二次确认，并清空当前数据。
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={importData}
            className="mt-4 w-full rounded-xl border border-gray-300 bg-white p-4 text-base font-bold"
          />
        </Card>

        <Card>
          <h3 className="text-xl font-extrabold text-red-600">清空全部数据</h3>
          <p className="mt-2 text-base font-medium text-gray-600">
            删除所有做T订单和完成记录。操作前会要求二次确认。
          </p>

          <button
            onClick={clearAllData}
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-red-600 py-4 text-lg font-extrabold text-white"
          >
            清空全部数据
          </button>
        </Card>
      </div>
    </PageContainer>
  );
}