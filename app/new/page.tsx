"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import Card from "@/components/Card";
import PrimaryButton from "@/components/PrimaryButton";
import QtySelector from "@/components/QtySelector";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getNowTime() {
  return new Date().toTimeString().slice(0, 5);
}

export default function NewTradePage() {
  const router = useRouter();

  const [direction, setDirection] = useState("买入开仓");
  const [qty, setQty] = useState(0);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [openDate, setOpenDate] = useState(getToday());
  const [openTime, setOpenTime] = useState(getNowTime());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const openPrice = Number(price);

    if (!openPrice || openPrice <= 0) {
      setMessage("请输入正确的开仓价格");
      return;
    }

    if (!qty || qty <= 0) {
      setMessage("请选择开仓数量");
      return;
    }

    const ok = window.confirm(
      `确认保存？\n\n方向：${direction}\n时间：${openDate} ${openTime}\n价格：${openPrice}\n数量：${qty} 股`
    );

    if (!ok) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("trades").insert({
      open_date: openDate,
      open_time: openTime,
      direction,
      open_price: openPrice,
      total_qty: qty,
      remaining_qty: qty,
      note,
      status: "进行中",
    });

    if (error) {
      setMessage("保存失败：" + error.message);
      setSaving(false);
      return;
    }

    router.push("/active");
  }

  return (
    <PageContainer>
      <PageTitle title="新建做T" subtitle="记录一笔新的开仓订单" />

      <form onSubmit={handleSubmit}>
        <Card className="space-y-5">
          <div className="rounded-2xl border border-gray-300 bg-white p-3">
            <p className="mb-2 text-sm font-bold text-gray-500">开仓时间</p>

            <div className="grid grid-cols-[1.35fr_0.65fr] gap-2">
              <input
                type="date"
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value)}
                required
                className="h-12 min-w-0 bg-transparent text-base font-extrabold text-gray-950"
              />

              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                required
                className="h-12 min-w-0 bg-transparent text-base font-extrabold text-gray-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDirection("买入开仓")}
              className={`rounded-2xl border py-5 text-xl font-extrabold active:scale-95 ${
                direction === "买入开仓"
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-green-600 bg-white text-green-700"
              }`}
            >
              买入开仓
            </button>

            <button
              type="button"
              onClick={() => setDirection("卖出开仓")}
              className={`rounded-2xl border py-5 text-xl font-extrabold active:scale-95 ${
                direction === "卖出开仓"
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-red-600 bg-white text-red-700"
              }`}
            >
              卖出开仓
            </button>
          </div>

          <div className="rounded-2xl bg-gray-100 p-4">
            <p className="mb-3 text-base font-bold text-gray-600">开仓价格</p>

            <input
              autoFocus
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              type="number"
              step="0.00000001"
              required
              className="h-24 w-full rounded-xl border border-gray-300 bg-white px-4 text-center text-4xl font-extrabold leading-tight text-blue-700"
              placeholder="0.00"
            />
          </div>

          <QtySelector qty={qty} setQty={setQty} />

          {message && (
            <p className="rounded-xl bg-red-50 p-3 text-base font-bold text-red-600">
              {message}
            </p>
          )}

          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "正在保存..." : "保存做T订单"}
          </PrimaryButton>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-20 w-full rounded-xl border border-gray-300 bg-white p-4 text-base font-bold text-gray-950"
            placeholder="备注，可不填"
          />
        </Card>
      </form>
    </PageContainer>
  );
}