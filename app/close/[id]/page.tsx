"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function CloseTradePage() {
  const params = useParams();
  const router = useRouter();
  const tradeId = Number(params.id);

  const today = new Date().toISOString().slice(0, 10);

  const [trade, setTrade] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTrade() {
      const { data } = await supabase
        .from("trades")
        .select("*")
        .eq("id", tradeId)
        .single();

      setTrade(data);
    }

    loadTrade();
  }, [tradeId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const close_date = form.get("close_date") as string;
    const close_price = Number(form.get("close_price"));
    const qty = Number(form.get("qty"));

    if (!trade) return;

    const fee = (Number(trade.open_price) * qty + close_price * qty) * 0.001;

    const profit =
      trade.direction === "买入开仓"
        ? (close_price - Number(trade.open_price)) * qty - fee
        : (Number(trade.open_price) - close_price) * qty - fee;

    const { error: insertError } = await supabase.from("executions").insert({
      trade_id: tradeId,
      close_date,
      close_price,
      qty,
      fee,
      profit,
    });

    if (insertError) {
      setMessage("保存失败：" + insertError.message);
      return;
    }

    const newRemainingQty = trade.remaining_qty - qty;

    await supabase
      .from("trades")
      .update({
        remaining_qty: newRemainingQty,
        status: newRemainingQty === 0 ? "已完成" : "进行中",
      })
      .eq("id", tradeId);

    router.push("/active");
    router.refresh();
  }

  if (!trade) return <div>加载中...</div>;

  const actionText = trade.direction === "买入开仓" ? "卖出" : "买入";

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">{actionText}完成做T</h2>

      <div className="bg-white rounded-xl p-6 shadow max-w-xl mb-6">
        <p>开仓方向：{trade.direction}</p>
        <p>开仓价格：${trade.open_price}</p>
        <p>剩余数量：{trade.remaining_qty} 股</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow max-w-xl">
        <div className="space-y-4">
          <input
            name="close_date"
            type="date"
            defaultValue={today}
            required
            className="w-full border rounded-lg p-3"
          />

          <input
            name="close_price"
            type="number"
            step="0.00000001"
            required
            className="w-full border rounded-lg p-3"
            placeholder={`${actionText}价格`}
          />

          <select name="qty" required className="w-full border rounded-lg p-3">
            {Array.from({ length: trade.remaining_qty }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {actionText} {num} 股
              </option>
            ))}
          </select>

          <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold">
            保存{actionText}记录
          </button>

          {message && <p className="font-bold">{message}</p>}
        </div>
      </form>
    </div>
  );
}