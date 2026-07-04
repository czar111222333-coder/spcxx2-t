"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getNowTime() {
  return new Date().toTimeString().slice(0, 5);
}

export default function NewTradePage() {
  const router = useRouter();

  const quickQty = [1, 3, 5, 7, 10];

  const [direction, setDirection] = useState("买入开仓");
  const [qty, setQty] = useState(0);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function addQty(num: number) {
    setQty((old) => old + num);
  }

  function minusQty() {
    setQty((old) => Math.max(0, old - 1));
  }

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
      `确认保存？\n\n方向：${direction}\n价格：${openPrice}\n数量：${qty} 股`
    );

    if (!ok) return;

    setSaving(true);
    setMessage("");

    const form = new FormData(event.currentTarget);

    const open_date = form.get("open_date") as string;
    const open_time = form.get("open_time") as string;

    const { error } = await supabase.from("trades").insert({
      open_date,
      open_time,
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

    alert("保存成功，已进入进行中订单");

    setPrice("");
    setQty(0);
    setNote("");
    setSaving(false);

    router.push("/active");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold">新建做T</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              name="open_date"
              type="date"
              defaultValue={getToday()}
              required
              className="border rounded-xl p-3 text-base"
            />

            <input
              name="open_time"
              type="time"
              defaultValue={getNowTime()}
              required
              className="border rounded-xl p-3 text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDirection("买入开仓")}
              className={`p-4 rounded-2xl font-bold text-xl border active:scale-95 transition ${
                direction === "买入开仓"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-green-600 border-green-600"
              }`}
            >
              买入开仓
            </button>

            <button
              type="button"
              onClick={() => setDirection("卖出开仓")}
              className={`p-4 rounded-2xl font-bold text-xl border active:scale-95 transition ${
                direction === "卖出开仓"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-red-600 border-red-600"
              }`}
            >
              卖出开仓
            </button>
          </div>

          <div className="bg-gray-100 rounded-2xl p-4">
            <p className="text-gray-500 mb-2">开仓价格</p>

            <input
              autoFocus
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              type="number"
              step="0.00000001"
              required
              className="w-full bg-white border rounded-xl p-4 text-5xl font-bold text-blue-700 text-center"
              placeholder="0.00"
            />
          </div>

          <div className="bg-gray-100 rounded-2xl p-4">
            <p className="text-gray-500 mb-3">快捷数量：点击会累加</p>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {quickQty.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => addQty(num)}
                  className="bg-white border rounded-xl py-4 text-2xl font-bold active:scale-95 transition"
                >
                  +{num}
                </button>
              ))}
            </div>

            <p className="text-gray-500 mb-2">当前开仓数量</p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={minusQty}
                className="w-16 h-16 bg-white rounded-xl text-3xl font-bold border active:scale-95 transition"
              >
                -
              </button>

              <input
                type="number"
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(Math.max(0, Number(e.target.value)))}
                className="flex-1 bg-white border rounded-xl p-4 text-center text-5xl font-bold"
              />

              <button
                type="button"
                onClick={() => addQty(1)}
                className="w-16 h-16 bg-white rounded-xl text-3xl font-bold border active:scale-95 transition"
              >
                +
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <button
                type="button"
                onClick={() => setQty(0)}
                className="bg-gray-700 text-white rounded-xl py-3 font-bold active:scale-95 transition"
              >
                清空数量
              </button>

              <button
                type="button"
                onClick={() => setQty(1)}
                className="bg-blue-600 text-white rounded-xl py-3 font-bold active:scale-95 transition"
              >
                重置为 1 股
              </button>
            </div>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded-xl p-4 text-base"
            placeholder="备注，可不填"
          />

          {message && <p className="font-bold text-red-600">{message}</p>}
        </div>

        <div className="sticky bottom-24 z-30">
          <button
            disabled={saving}
            className={`w-full text-white px-6 py-5 rounded-2xl font-bold text-2xl shadow-lg active:scale-95 transition ${
              saving ? "bg-gray-400" : "bg-green-600"
            }`}
          >
            {saving ? "正在保存..." : "保存做T订单"}
          </button>
        </div>
      </form>
    </div>
  );
}