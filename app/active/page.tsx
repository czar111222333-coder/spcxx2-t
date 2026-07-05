"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function money(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function profitColor(value: number) {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "text-gray-900";
}

export default function ActivePage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  async function loadTrades() {
    const { data } = await supabase
      .from("trades")
      .select(`*, executions (*)`)
      .eq("status", "进行中")
      .order("created_at", { ascending: false });

    setTrades(data || []);
  }

  useEffect(() => {
    loadTrades();
  }, []);

  async function completeTrade(
    event: React.FormEvent<HTMLFormElement>,
    trade: any
  ) {
    event.preventDefault();
    if (savingId) return;

    const form = new FormData(event.currentTarget);
    const close_date = form.get("close_date") as string;
    const close_time = form.get("close_time") as string;
    const close_price = Number(form.get("close_price"));
    const qty = Number(form.get("qty"));

    if (!close_price || close_price <= 0) {
      setMessage("请输入正确的完成价格");
      return;
    }

    const actionText = trade.direction === "买入开仓" ? "卖出" : "买入";

    const ok = window.confirm(
      `确认${actionText}完成？\n\nT${trade.id}\n价格：${close_price}\n数量：${qty} 股`
    );

    if (!ok) return;

    setSavingId(trade.id);

    const fee = (Number(trade.open_price) * qty + close_price * qty) * 0.001;

    const profit =
      trade.direction === "买入开仓"
        ? (close_price - Number(trade.open_price)) * qty - fee
        : (Number(trade.open_price) - close_price) * qty - fee;

    const { data: newExecution, error: insertError } = await supabase
      .from("executions")
      .insert({
        trade_id: trade.id,
        close_date,
        close_time,
        close_price,
        qty,
        fee,
        profit,
      })
      .select()
      .single();

    if (insertError) {
      setMessage("保存失败：" + insertError.message);
      setSavingId(null);
      return;
    }

    const newRemainingQty = Number(trade.remaining_qty) - qty;
    const newStatus = newRemainingQty === 0 ? "已完成" : "进行中";

    const { error: updateError } = await supabase
      .from("trades")
      .update({
        remaining_qty: newRemainingQty,
        status: newStatus,
      })
      .eq("id", trade.id);

    if (updateError) {
      setMessage("更新失败：" + updateError.message);
      setSavingId(null);
      return;
    }

    setTrades((oldTrades) =>
      oldTrades
        .map((item) => {
          if (item.id !== trade.id) return item;

          return {
            ...item,
            remaining_qty: newRemainingQty,
            status: newStatus,
            executions: [...item.executions, newExecution],
          };
        })
        .filter((item) => item.status === "进行中")
    );

    setMessage(`T${trade.id} ${actionText}完成记录已保存`);
    setSavingId(null);
  }

  async function undoExecution(trade: any, execution: any) {
    const ok = window.confirm(
      `确定撤销这条完成记录吗？\n\n价格：${execution.close_price}\n数量：${execution.qty} 股`
    );

    if (!ok) return;

    const restoredQty = Number(trade.remaining_qty) + Number(execution.qty);

    const { error: deleteError } = await supabase
      .from("executions")
      .delete()
      .eq("id", execution.id);

    if (deleteError) {
      setMessage("撤销失败：" + deleteError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from("trades")
      .update({
        remaining_qty: restoredQty,
        status: "进行中",
      })
      .eq("id", trade.id);

    if (updateError) {
      setMessage("恢复数量失败：" + updateError.message);
      return;
    }

    setTrades((oldTrades) =>
      oldTrades.map((item) => {
        if (item.id !== trade.id) return item;

        return {
          ...item,
          remaining_qty: restoredQty,
          status: "进行中",
          executions: item.executions.filter((ex: any) => ex.id !== execution.id),
        };
      })
    );

    setMessage(`T${trade.id} 已撤销一条完成记录`);
  }

  async function cancelTrade(id: number) {
    const ok = window.confirm("确定撤单吗？撤单后这笔做T会被删除。");
    if (!ok) return;

    const { error } = await supabase.from("trades").delete().eq("id", id);

    if (error) {
      setMessage("撤单失败：" + error.message);
      return;
    }

    setTrades((oldTrades) => oldTrades.filter((item) => item.id !== id));
    setMessage(`T${id} 撤单成功`);
  }

  return (
    <PageContainer>
      <PageTitle title="进行中订单" />

      {message && (
        <div className="mb-4 rounded-xl border border-green-300 bg-green-50 p-4 text-base font-bold text-green-700">
          {message}
        </div>
      )}

      <div className="space-y-5">
        {trades.map((trade) => {
          const doneQty = Number(trade.total_qty) - Number(trade.remaining_qty);
          const actionText = trade.direction === "买入开仓" ? "卖出" : "买入";

          const totalProfit = trade.executions.reduce(
            (sum: number, item: any) => sum + Number(item.profit || 0),
            0
          );

          const totalFee = trade.executions.reduce(
            (sum: number, item: any) => sum + Number(item.fee || 0),
            0
          );

          return (
            <Card key={trade.id}>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-gray-600">订单编号</p>
                  <p className="mt-1 text-3xl font-extrabold text-gray-950">
                    T{String(trade.id).padStart(6, "0")}
                  </p>
                </div>

                <div
                  className={`rounded-xl px-4 py-2 text-base font-extrabold ${
                    trade.direction === "买入开仓"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {trade.direction}
                </div>
              </div>

              <div className="mb-5 space-y-3 rounded-2xl bg-gray-100 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-600">开仓日期</p>
                    <p className="mt-1 text-xl font-extrabold text-gray-950">
                      {trade.open_date}
                    </p>
                    {trade.open_time && (
                      <p className="text-lg font-bold text-gray-900">
                        {trade.open_time}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-600">状态</p>
                    <p className="mt-1 text-xl font-extrabold text-yellow-600">
                      进行中
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-xl bg-white p-4">
                    <p className="text-sm font-bold text-gray-600">开仓价格</p>
                    <p className="mt-1 text-4xl font-extrabold leading-tight text-blue-700">
                      ${Number(trade.open_price || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-4">
                      <p className="text-sm font-bold text-gray-600">开仓数量</p>
                      <p className="mt-1 text-3xl font-extrabold text-gray-950">
                        {trade.total_qty}
                        <span className="ml-1 text-xl">股</span>
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-4">
                      <p className="text-sm font-bold text-gray-600">剩余数量</p>
                      <p className="mt-1 text-3xl font-extrabold text-red-600">
                        {trade.remaining_qty}
                        <span className="ml-1 text-xl">股</span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-sm font-bold text-gray-600">已完成数量</p>
                    <p className="mt-1 text-2xl font-extrabold text-gray-950">
                      {doneQty} 股
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm font-bold text-gray-600">已实现净利润</p>
                  <p
                    className={`mt-1 text-2xl font-extrabold ${profitColor(
                      totalProfit
                    )}`}
                  >
                    {money(totalProfit)}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm font-bold text-gray-600">累计手续费</p>
                  <p className="mt-1 text-2xl font-extrabold text-gray-950">
                    ${totalFee.toFixed(2)}
                  </p>
                </div>
              </div>

              {trade.executions.length > 0 && (
                <div className="mb-5 border-t pt-5">
                  <p className="mb-3 text-xl font-extrabold text-gray-950">
                    完成明细
                  </p>

                  <div className="space-y-3">
                    {trade.executions.map((item: any) => (
                      <div key={item.id} className="rounded-xl bg-gray-50 p-4">
                        <p className="text-base font-extrabold text-gray-950">
                          {item.close_date} {item.close_time || ""}
                        </p>

                        <p className="mt-1 text-base font-bold text-gray-900">
                          {actionText} $
                          {Number(item.close_price || 0).toFixed(2)} ×{" "}
                          {item.qty} 股
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-gray-600">
                              手续费 ${Number(item.fee || 0).toFixed(2)}
                            </p>
                            <p
                              className={`text-xl font-extrabold ${profitColor(
                                Number(item.profit || 0)
                              )}`}
                            >
                              {money(Number(item.profit || 0))}
                            </p>
                          </div>

                          <button
                            onClick={() => undoExecution(trade, item)}
                            className="rounded-lg bg-orange-500 px-4 py-2 text-base font-bold text-white"
                          >
                            撤销
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form
                onSubmit={(event) => completeTrade(event, trade)}
                className="border-t pt-5"
              >
                <p className="mb-3 text-xl font-extrabold text-gray-950">
                  {actionText}完成
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <input
                    name="close_date"
                    type="date"
                    defaultValue={today()}
                    required
                    className="w-full rounded-xl border p-4 text-lg font-bold"
                  />

                  <input
                    name="close_time"
                    type="time"
                    defaultValue={nowTime()}
                    required
                    className="w-full rounded-xl border p-4 text-lg font-bold"
                  />

                  <input
                    name="close_price"
                    type="number"
                    step="0.00000001"
                    required
                    className="w-full rounded-xl border p-4 text-lg font-bold"
                    placeholder={`${actionText}价格`}
                  />

                  <select
                    name="qty"
                    required
                    className="w-full rounded-xl border p-4 text-lg font-bold"
                  >
                    {Array.from(
                      { length: Number(trade.remaining_qty) },
                      (_, i) => i + 1
                    ).map((num) => (
                      <option key={num} value={num}>
                        {num} 股
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <button
                    disabled={savingId === trade.id}
                    className={`w-full rounded-xl py-4 text-lg font-extrabold text-white ${
                      savingId === trade.id ? "bg-gray-400" : "bg-green-600"
                    }`}
                  >
                    {savingId === trade.id
                      ? "正在保存..."
                      : `保存${actionText}记录`}
                  </button>

                  <button
                    type="button"
                    onClick={() => cancelTrade(trade.id)}
                    className="w-full rounded-xl bg-red-600 py-4 text-lg font-extrabold text-white"
                  >
                    撤单
                  </button>
                </div>
              </form>
            </Card>
          );
        })}

        {trades.length === 0 && <EmptyState text="暂无进行中的做T订单" />}
      </div>
    </PageContainer>
  );
}