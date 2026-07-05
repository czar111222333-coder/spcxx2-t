"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";

function money(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function profitColor(value: number) {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "text-gray-900";
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
    <PageContainer>
      <PageTitle title="已完成记录" />

      {message && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 text-base font-bold text-red-700">
          {message}
        </div>
      )}

      <div className="space-y-5">
        {trades.map((trade) => {
          const isOpen = openId === trade.id;

          const totalProfit = trade.executions.reduce(
            (sum: number, item: any) => sum + Number(item.profit || 0),
            0
          );

          const totalFee = trade.executions.reduce(
            (sum: number, item: any) => sum + Number(item.fee || 0),
            0
          );

          const totalAmount =
            Number(trade.open_price || 0) * Number(trade.total_qty || 0);

          const returnRate =
            totalAmount === 0 ? 0 : (totalProfit / totalAmount) * 100;

          const actionText = trade.direction === "买入开仓" ? "卖出" : "买入";

          return (
            <Card key={trade.id}>
              <button
                onClick={() => setOpenId(isOpen ? null : trade.id)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-gray-600">订单编号</p>
                    <p className="mt-1 text-3xl font-extrabold text-gray-950">
                      T{String(trade.id).padStart(6, "0")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-2xl font-extrabold ${profitColor(
                        totalProfit
                      )}`}
                    >
                      {money(totalProfit)}
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-600">
                      {isOpen ? "点击收起 ▲" : "点击展开 ▼"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-base font-bold text-gray-950">
                  <p>方向：{trade.direction}</p>
                  <p>数量：{trade.total_qty} 股</p>
                  <p>开仓：${Number(trade.open_price || 0).toFixed(2)}</p>
                  <p>完成：{trade.executions.length} 次</p>
                </div>
              </button>

              {isOpen && (
                <div className="mt-5 border-t pt-5">
                  <div className="mb-5 space-y-3 rounded-2xl bg-gray-100 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm font-bold text-gray-600">
                          开仓方向
                        </p>
                        <p
                          className={`mt-1 text-xl font-extrabold ${
                            trade.direction === "买入开仓"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {trade.direction}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-gray-600">
                          开仓时间
                        </p>
                        <p className="mt-1 text-xl font-extrabold text-gray-950">
                          {trade.open_date}
                        </p>
                        {trade.open_time && (
                          <p className="text-lg font-bold text-gray-900">
                            {trade.open_time}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-4">
                      <p className="text-sm font-bold text-gray-600">开仓价格</p>
                      <p className="mt-1 text-4xl font-extrabold leading-tight text-blue-700">
                        ${Number(trade.open_price || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-4">
                      <p className="text-sm font-bold text-gray-600">开仓数量</p>
                      <p className="mt-1 text-4xl font-extrabold leading-tight text-gray-950">
                        {trade.total_qty}
                        <span className="ml-1 text-2xl">股</span>
                      </p>
                    </div>
                  </div>

                  <p className="mb-3 text-xl font-extrabold text-gray-950">
                    完成明细
                  </p>

                  <div className="mb-5 space-y-3">
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

                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm font-bold text-gray-600">
                              手续费
                            </p>
                            <p className="text-xl font-extrabold text-gray-950">
                              ${Number(item.fee || 0).toFixed(2)}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-bold text-gray-600">
                              净利润
                            </p>
                            <p
                              className={`text-xl font-extrabold ${profitColor(
                                Number(item.profit || 0)
                              )}`}
                            >
                              {money(Number(item.profit || 0))}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-sm font-bold text-gray-600">总手续费</p>
                      <p className="mt-1 text-2xl font-extrabold text-gray-950">
                        ${totalFee.toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-sm font-bold text-gray-600">净利润</p>
                      <p
                        className={`mt-1 text-2xl font-extrabold ${profitColor(
                          totalProfit
                        )}`}
                      >
                        {money(totalProfit)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-sm font-bold text-gray-600">收益率</p>
                      <p
                        className={`mt-1 text-2xl font-extrabold ${profitColor(
                          returnRate
                        )}`}
                      >
                        {returnRate.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {trades.length === 0 && <EmptyState text="暂无已完成做T记录" />}
      </div>
    </PageContainer>
  );
}