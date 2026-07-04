"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function money(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

export default function CompletedPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTrades() {
      const { data, error } = await supabase
        .from("trades")
        .select(`*, executions (*)`)
        .eq("status", "已完成")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("读取失败：" + error.message);
        return;
      }

      setTrades(data || []);
    }

    loadTrades();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">已完成做T记录</h2>

      {message && <p className="mb-4 font-bold text-red-600">{message}</p>}

      <div className="space-y-4">
        {trades.map((trade) => {
          const isOpen = openId === trade.id;

          const totalProfit = trade.executions.reduce(
            (sum: number, item: any) => sum + Number(item.profit),
            0
          );

          const totalFee = trade.executions.reduce(
            (sum: number, item: any) => sum + Number(item.fee),
            0
          );

          const totalAmount =
            Number(trade.open_price) * Number(trade.total_qty);

          const returnRate =
            totalAmount === 0 ? 0 : (totalProfit / totalAmount) * 100;

          const actionText = trade.direction === "买入开仓" ? "卖出" : "买入";

          return (
            <div key={trade.id} className="bg-white rounded-2xl p-6 shadow">
              <button
                onClick={() => setOpenId(isOpen ? null : trade.id)}
                className="w-full text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500">订单编号</p>
                    <p className="text-2xl font-bold">
                      T{String(trade.id).padStart(6, "0")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        totalProfit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {money(totalProfit)}
                    </p>
                    <p className="text-gray-500">
                      {isOpen ? "点击收起 ▲" : "点击展开 ▼"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                  <p>方向：{trade.direction}</p>
                  <p>开仓：${Number(trade.open_price).toFixed(2)}</p>
                  <p>数量：{trade.total_qty} 股</p>
                  <p>完成次数：{trade.executions.length}</p>
                </div>
              </button>

              {isOpen && (
                <div className="mt-5 border-t pt-5">
                  <div className="grid grid-cols-2 gap-4 bg-gray-100 rounded-2xl p-5 mb-5">
                    <div>
                      <p className="text-gray-500">开仓方向</p>
                      <p
                        className={`text-xl font-bold ${
                          trade.direction === "买入开仓"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {trade.direction}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">开仓时间</p>
                      <p className="text-xl font-bold">
                        {trade.open_date} {trade.open_time || ""}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">开仓价格</p>
                      <p className="text-4xl font-bold text-blue-700">
                        ${Number(trade.open_price).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">开仓数量</p>
                      <p className="text-4xl font-bold">
                        {trade.total_qty} 股
                      </p>
                    </div>
                  </div>

                  <p className="font-bold mb-3">完成明细</p>

                  <div className="space-y-2 mb-5">
                    {trade.executions.map((item: any) => (
                      <div key={item.id} className="bg-gray-50 rounded-xl p-3">
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
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-500">总手续费</p>
                      <p className="text-2xl font-bold">
                        ${totalFee.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-500">净利润</p>
                      <p
                        className={`text-2xl font-bold ${
                          totalProfit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {money(totalProfit)}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-500">收益率</p>
                      <p
                        className={`text-2xl font-bold ${
                          returnRate >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {returnRate.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {trades.length === 0 && (
          <div className="bg-white rounded-xl p-8 shadow text-gray-500 text-center">
            暂无已完成做T记录
          </div>
        )}
      </div>
    </div>
  );
}