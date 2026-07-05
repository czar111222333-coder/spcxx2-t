"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import EmptyState from "@/components/EmptyState";
import ActiveTradeCard from "@/components/active/ActiveTradeCard";

const FEE_RATE = 0.001;

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
    return qtyMap[trade.id] ?? "";
  }

  function setCloseQty(trade: any, value: string | number) {
    setQtyMap((old) => ({
      ...old,
      [trade.id]: String(value),
    }));
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
    const qty = Number(getQtyValue(trade));
    const remainingQty = Number(trade.remaining_qty || 0);
    const openPrice = Number(trade.open_price || 0);

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

    const openFeePart = openPrice * qty * FEE_RATE;
    const closeFee = close_price * qty * FEE_RATE;
    const totalFee = openFeePart + closeFee;

    const profit =
      trade.direction === "买入开仓"
        ? (close_price - openPrice) * qty - totalFee
        : (openPrice - close_price) * qty - totalFee;

    const ok = window.confirm(
      `确认${actionText}完成？\n\nT${trade.id}\n价格：${close_price}\n数量：${qty} 股\n本次手续费：$${totalFee.toFixed(
        2
      )}`
    );

    if (!ok) return;

    setSavingId(trade.id);

    const { data: newExecution, error: insertError } = await supabase
      .from("executions")
      .insert({
        trade_id: trade.id,
        close_date,
        close_time,
        close_price,
        qty,
        close_fee: closeFee,
        fee: totalFee,
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

  async function undoExecution(trade: any, execution: any) {
    const ok = window.confirm(
      `确定撤销这条完成记录吗？\n\n价格：${execution.close_price}\n数量：${execution.qty} 股`
    );

    if (!ok) return;

    const restoredQty =
      Number(trade.remaining_qty || 0) + Number(execution.qty || 0);

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
    <PageContainer>
      <PageTitle title="进行中订单" />

      {message && (
        <div className="mb-4 rounded-xl border border-green-300 bg-green-50 p-4 text-base font-bold text-green-700">
          {message}
        </div>
      )}

      <div className="space-y-5">
        {trades.map((trade) => (
          <ActiveTradeCard
            key={trade.id}
            trade={trade}
            isOpen={openId === trade.id}
            qtyValue={getQtyValue(trade)}
            saving={savingId === trade.id}
            onToggle={() => setOpenId(openId === trade.id ? null : trade.id)}
            onQtyChange={(value) => setCloseQty(trade, value)}
            onQuickQty={(value) => setCloseQty(trade, value)}
            onSubmit={(event) => completeTrade(event, trade)}
            onCancel={() => cancelTrade(trade.id)}
            onUndo={(execution) => undoExecution(trade, execution)}
          />
        ))}

        {trades.length === 0 && <EmptyState text="暂无进行中的做T订单" />}
      </div>
    </PageContainer>
  );
}