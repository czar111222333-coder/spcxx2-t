"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAppSettings } from "@/lib/settings";

export default function SettingsForm() {
  const [symbol, setSymbol] = useState("");
  const [feeRate, setFeeRate] = useState("");
  const [quickQty, setQuickQty] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const settings = await getAppSettings();

    setSymbol(settings.symbol || "SPCX");
    setFeeRate(String(settings.fee_rate));
    setQuickQty(settings.quick_qty || "1,3,5,7,10");
  }

  async function save() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("app_settings")
      .update({
        symbol,
        fee_rate: Number(feeRate),
        quick_qty: quickQty,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("设置保存成功");
    }

    setLoading(false);
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <h2 className="text-2xl font-extrabold mb-5">
        ⚙ 系统设置
      </h2>

      <div className="space-y-5">
        <div>
          <p className="mb-2 font-bold text-gray-600">
            股票代码
          </p>

          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="w-full rounded-xl border p-4 text-xl font-bold"
          />
        </div>

        <div>
          <p className="mb-2 font-bold text-gray-600">
            手续费率
          </p>

          <input
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
            type="number"
            step="0.00000001"
            className="w-full rounded-xl border p-4 text-xl font-bold"
          />
        </div>

        <div>
          <p className="mb-2 font-bold text-gray-600">
            快捷数量
          </p>

          <input
            value={quickQty}
            onChange={(e) => setQuickQty(e.target.value)}
            className="w-full rounded-xl border p-4 text-xl font-bold"
            placeholder="1,3,5,7,10"
          />
        </div>

        {message && (
          <div className="rounded-xl bg-green-50 p-3 text-green-700 font-bold">
            {message}
          </div>
        )}

        <button
          onClick={save}
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-4 text-lg font-extrabold text-white"
        >
          {loading ? "保存中..." : "保存设置"}
        </button>
      </div>
    </div>
  );
}