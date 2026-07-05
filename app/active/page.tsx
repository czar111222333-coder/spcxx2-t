"use client";
import PageContainer from "../../components/PageContainer";
import PageTitle from "../../components/PageTitle";
import EmptyState from "../../components/EmptyState";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

  async function completeTrade(event: React.FormEvent<HTMLFormElement>, trade: any) {
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

    const newRemainingQty = trade.remaining_qty - qty;
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
          executions: item.executions.filter(
            (ex: any) => ex.id !== execution.id
          ),
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
    <div>
      <h2 className="text-3xl font-bold mb-8">进行中订单管理</h2>

      {message && (
        <div className="mb-4 bg-green-50 border border-green-300 text-green-700 rounded-xl p-4 font-bold">
          {message}
        </div>
      )}

      <div className="space-y-6">
        {trades.map((trade) => {
          const doneQty = trade.total_qty - trade.remaining_qty;
          const actionText = trade.direction === "买入开仓" ? "卖出" : "买入";

          const totalProfit = trade.executions.reduce(
            (sum: number, item: any) => sum + Number(item.profit),
            0
          );

          const totalFee = trade.executions.reduce(
            (sum: number, item: any) => sum + Number(item.fee),
            0
          );

          return (
            <div key={trade.id} className="bg-white rounded-2xl p-6 shadow">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <p className="text-gray-500">订单编号</p>
                  <p className="text-3xl font-bold">
                    T{String(trade.id).padStart(6, "0")}
                  </p>
                </div>

                <div
                  className={`px-4 py-2 rounded-xl font-bold ${
                    trade.direction === "买入开仓"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {trade.direction}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-100 rounded-2xl p-5 mb-5">
                <div>
                  <p className="text-gray-500">开仓时间</p>
                  <p className="text-xl font-bold">
                    {trade.open_date} {trade.open_time || ""}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">状态</p>
                  <p className="text-xl font-bold text-yellow-600">进行中</p>
                </div>

                <div>
                  <p className="text-gray-500">开仓价格</p>
                  <p className="text-5xl font-bold text-blue-700">
                    ${Number(trade.open_price).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">开仓数量</p>
                  <p className="text-5xl font-bold">{trade.total_qty} 股</p>
                </div>

                <div>
                  <p className="text-gray-500">已完成数量</p>
                  <p className="text-3xl font-bold">{doneQty} 股</p>
                </div>

                <div>
                  <p className="text-gray-500">剩余数量</p>
                  <p className="text-3xl font-bold text-red-600">
                    {trade.remaining_qty} 股
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500">已实现净利润</p>
                  <p
                    className={`text-2xl font-bold ${
                      totalProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {money(totalProfit)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500">累计手续费</p>
                  <p className="text-2xl font-bold">${totalFee.toFixed(2)}</p>
                </div>
              </div>

              {trade.executions.length > 0 && (
                <div className="border-t pt-4 mb-5">
                  <p className="font-bold mb-3">完成明细</p>

                  <div className="space-y-2">
                    {trade.executions.map((item: any) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-xl p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold">
                            {item.close_date} {item.close_time || ""} ｜{" "}
                            {actionText} ${Number(item.close_price).toFixed(2)} ×{" "}
                            {item.qty} 股
                          </p>

                          <p>
                            手续费 ${Number(item.fee).toFixed(2)} ｜ 净利润{" "}
                            <span
                              className={
                                Number(item.profit) >= 0
                                  ? "text-green-600 font-bold"
                                  : "text-red-600 font-bold"
                              }
                            >
                              {money(Number(item.profit))}
                            </span>
                          </p>
                        </div>

                        <button
                          onClick={() => undoExecution(trade, item)}
                          className="bg-orange-500 text-white px-3 py-2 rounded-lg font-bold"
                        >
                          撤销
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form
                onSubmit={(event) => completeTrade(event, trade)}
                className="border-t pt-5"
              >
                <p className="font-bold text-xl mb-3">{actionText}完成</p>

                <div className="grid grid-cols-4 gap-3">
                  <input
                    name="close_date"
                    type="date"
                    defaultValue={today()}
                    required
                    className="border rounded-lg p-3"
                  />

                  <input
                    name="close_time"
                    type="time"
                    defaultValue={nowTime()}
                    required
                    className="border rounded-lg p-3"
                  />

                  <input
                    name="close_price"
                    type="number"
                    step="0.00000001"
                    required
                    className="border rounded-lg p-3"
                    placeholder={`${actionText}价格`}
                  />

                  <select name="qty" required className="border rounded-lg p-3">
                    {Array.from(
                      { length: trade.remaining_qty },
                      (_, i) => i + 1
                    ).map((num) => (
                      <option key={num} value={num}>
                        {num} 股
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    disabled={savingId === trade.id}
                    className={`px-5 py-3 rounded-lg font-bold text-white ${
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
                    className="bg-red-600 text-white px-5 py-3 rounded-lg font-bold"
                  >
                    撤单
                  </button>
                </div>
              </form>
            </div>
          );
        })}

{trades.length === 0 && (
  <EmptyState text="暂无进行中的做T订单" />
)}
      </div>
    </div>
  );
}