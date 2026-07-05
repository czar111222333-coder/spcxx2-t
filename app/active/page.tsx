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
  const [openId, setOpenId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [qtyMap, setQtyMap] = useState<Record<number, string>>({});

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

  function getQtyValue(trade: any) {
    return qtyMap[trade.id] ?? String(trade.remaining_qty || "");
  }

  function getQtyNumber(trade: any) {
    return Number(getQtyValue(trade) || 0);
  }

  function setCloseQty(trade: any, value: number | string) {
    setQtyMap((old) => ({
      ...old,
      [trade.id]: String(value),
    }));
  }

  function blurInput() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

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
    const qty = getQtyNumber(trade);
    const remainingQty = Number(trade.remaining_qty || 0);

    if (!close_price || close_price <= 0) {
      setMessage("请输入正确的完成价格");
      return;
    }

    if (!qty || qty <= 0) {
      setMessage("请输入正确的完成数量");
      return;
    }

    if (qty > remainingQty) {
      setMessage(`完成数量不能超过剩余数量 ${remainingQty} 股`);
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

    const newRemainingQty = remainingQty - qty;
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

    setQtyMap((old) => {
      const copy = { ...old };
      delete copy[trade.id];
      return copy;
    });

    setMessage(`T${trade.id} ${actionText}完成记录已保存`);
    setSavingId(null);
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
          const isOpen = openId === trade.id;
          const doneQty = Number(trade.total_qty) - Number(trade.remaining_qty);
          const remainingQty = Number(trade.remaining_qty || 0);
          const actionText = trade.direction === "买入开仓" ? "卖出" : "买入";
          const quickList = [1, 3, 5, 7, 10].filter(
            (num) => num <= remainingQty
          );

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
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : trade.id)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-gray-600">
                      订单编号
                    </p>
                    <p className="mt-1 text-3xl font-extrabold text-gray-950">
                      T{String(trade.id).padStart(6, "0")}
                    </p>
                  </div>

                  <div className="text-right">
                    <div
                      className={`rounded-xl px-4 py-2 text-base font-extrabold ${
                        trade.direction === "买入开仓"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {trade.direction}
                    </div>

                    <p className="mt-2 text-sm font-bold text-gray-500">
                      {isOpen ? "点击收起 ▲" : "点击展开 ▼"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-base font-bold text-gray-950">
                  <p>开仓：${Number(trade.open_price || 0).toFixed(2)}</p>
                  <p>总数：{trade.total_qty} 股</p>
                  <p>已完成：{doneQty} 股</p>
                  <p className="text-red-600">剩余：{remainingQty} 股</p>
                </div>
              </button>

              {isOpen && (
                <div className="mt-5 border-t pt-5">
                  <div className="mb-4 rounded-2xl bg-gray-100 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm font-bold text-gray-600">
                          开仓价格
                        </p>
                        <p className="mt-1 text-3xl font-extrabold text-blue-700">
                          ${Number(trade.open_price || 0).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-gray-600">
                          剩余数量
                        </p>
                        <p className="mt-1 text-3xl font-extrabold text-red-600">
                          {remainingQty} 股
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-sm font-bold text-gray-600">
                          已实现净利润
                        </p>
                        <p
                          className={`mt-1 text-xl font-extrabold ${profitColor(
                            totalProfit
                          )}`}
                        >
                          {money(totalProfit)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3">
                        <p className="text-sm font-bold text-gray-600">
                          累计手续费
                        </p>
                        <p className="mt-1 text-xl font-extrabold">
                          ${totalFee.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={(event) => completeTrade(event, trade)}>
                    <p className="mb-3 text-xl font-extrabold">
                      {actionText}完成
                    </p>

                    <div className="rounded-2xl border border-gray-300 bg-white p-3">
                      <p className="mb-2 text-sm font-bold text-gray-500">
                        完成时间
                      </p>

                      <div className="grid grid-cols-[1.35fr_0.65fr] gap-2">
                        <input
                          name="close_date"
                          type="date"
                          defaultValue={today()}
                          required
                          className="h-12 min-w-0 bg-transparent text-base font-extrabold text-gray-950"
                        />

                        <input
                          name="close_time"
                          type="time"
                          defaultValue={nowTime()}
                          required
                          className="h-12 min-w-0 bg-transparent text-base font-extrabold text-gray-950"
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3">
                    <input
  name="close_price"
  type="number"
  inputMode="decimal"
  step="0.00000001"
  required
  className="w-full rounded-xl border p-4 text-lg font-bold"
  placeholder={`${actionText}价格`}
/>

                      <div className="rounded-2xl bg-gray-100 p-4">
                        <p className="mb-3 text-base font-bold text-gray-600">
                          {actionText}数量
                        </p>

                        <div className="mb-3 grid grid-cols-6 gap-2">
                          {quickList.map((num) => (
                            <button
                              key={num}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                blurInput();
                                setCloseQty(trade, num);
                              }}
                              className="rounded-xl border bg-white py-3 text-lg font-extrabold"
                            >
                              {num}
                            </button>
                          ))}

                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              blurInput();
                              setCloseQty(trade, remainingQty);
                            }}
                            className="rounded-xl bg-gray-900 py-3 text-base font-extrabold text-white"
                          >
                            全部
                          </button>
                        </div>

                        <input
                          type="number"
                          inputMode="numeric"
                          value={getQtyValue(trade)}
                          onChange={(e) => setCloseQty(trade, e.target.value)}
                          className="h-16 w-full rounded-xl border bg-white text-center text-3xl font-extrabold"
                          placeholder="股数"
                        />

                        <p className="mt-2 text-sm font-bold text-gray-500">
                          剩余 {remainingQty} 股，快捷按钮不会超过剩余数量
                        </p>
                      </div>
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
                </div>
              )}
            </Card>
          );
        })}

        {trades.length === 0 && <EmptyState text="暂无进行中的做T订单" />}
      </div>
    </PageContainer>
  );
}