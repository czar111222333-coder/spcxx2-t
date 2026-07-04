"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getNowTime() {
  return new Date().toTimeString().slice(0, 5);
}

export default function NewTradePage() {
  const quickQty = [1, 2, 3, 5, 10, 20, 30, 50, 100];

  const [direction, setDirection] = useState("买入开仓");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const openPrice = Number(price);

    if (!openPrice || openPrice <= 0) {
      setMessage("请输入正确的开仓价格");
      return;
    }

    const ok = window.confirm(
      `确认挂单？\n\n方向：${direction}\n价格：${openPrice}\n数量：${qty} 股`
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

    setSuccess({
      direction,
      price: openPrice,
      qty,
    });

    setPrice("");
    setQty(1);
    setNote("");
    setSaving(false);

    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">新建做T</h2>

      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-96 text-center">
            <p className="text-5xl mb-4">✅</p>
            <h3 className="text-2xl font-bold mb-4">挂单成功</h3>

            <div className="bg-gray-100 rounded-xl p-4 text-left space-y-2">
              <p>
                方向：
                <span
                  className={
                    success.direction === "买入开仓"
                      ? "text-green-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  {success.direction}
                </span>
              </p>
              <p>价格：${Number(success.price).toFixed(2)}</p>
              <p>数量：{success.qty} 股</p>
              <p className="text-gray-500">已进入进行中订单</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow max-w-xl">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <input
              name="open_date"
              type="date"
              defaultValue={getToday()}
              required
              className="border rounded-lg p-3"
            />

            <input
              name="open_time"
              type="time"
              defaultValue={getNowTime()}
              required
              className="border rounded-lg p-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setDirection("买入开仓")}
              className={`p-5 rounded-xl font-bold border text-xl ${
                direction === "买入开仓"
                  ? "bg-green-600 text-white"
                  : "bg-white text-green-600 border-green-600"
              }`}
            >
              买入开仓
            </button>

            <button
              type="button"
              onClick={() => setDirection("卖出开仓")}
              className={`p-5 rounded-xl font-bold border text-xl ${
                direction === "卖出开仓"
                  ? "bg-red-600 text-white"
                  : "bg-white text-red-600 border-red-600"
              }`}
            >
              卖出开仓
            </button>
          </div>

          <div className="bg-gray-100 rounded-xl p-5">
            <p className="text-gray-500 mb-2">开仓价格</p>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              step="0.00000001"
              required
              className="w-full bg-white border rounded-lg p-4 text-4xl font-bold text-blue-700"
              placeholder="0.00"
            />
          </div>

          <div className="bg-gray-100 rounded-xl p-5">
            <p className="text-gray-500 mb-3">快捷数量</p>

            <div className="grid grid-cols-5 gap-3 mb-5">
              {quickQty.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQty(num)}
                  className={`py-3 rounded-lg font-bold border ${
                    qty === num
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <p className="text-gray-500 mb-2">当前开仓数量</p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-16 h-16 bg-white rounded-lg text-3xl font-bold border"
              >
                -
              </button>

              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                className="flex-1 bg-white border rounded-lg p-4 text-center text-4xl font-bold"
              />

              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="w-16 h-16 bg-white rounded-lg text-3xl font-bold border"
              >
                +
              </button>
            </div>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="备注"
          />

          <button
            disabled={saving}
            className={`w-full text-white px-6 py-4 rounded-lg font-bold text-xl ${
              saving ? "bg-gray-400" : "bg-green-600"
            }`}
          >
            {saving ? "正在保存..." : "保存做T订单"}
          </button>

          {message && <p className="font-bold text-red-600">{message}</p>}
        </div>
      </form>
    </div>
  );
}