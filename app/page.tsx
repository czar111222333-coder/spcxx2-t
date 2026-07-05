export const dynamic = "force-dynamic";
export const revalidate = 0;

import { supabase } from "@/lib/supabase";
import { getAppSettings } from "@/lib/settings";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";

function money(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function usd(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function profitColor(value: number) {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "text-gray-900";
}

export default async function Home() {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  const settings = await getAppSettings();

  const { data: trades } = await supabase.from("trades").select("*");
  const { data: executions } = await supabase.from("executions").select("*");

  const tradeList = trades || [];
  const executionList = executions || [];

  const activeTrades = tradeList.filter((item) => item.status === "进行中");
  const completedTrades = tradeList.filter((item) => item.status === "已完成");

  const todayExecutions = executionList.filter(
    (item) => item.close_date === today
  );

  const monthExecutions = executionList.filter((item) =>
    item.close_date?.startsWith(month)
  );

  const todayProfit = todayExecutions.reduce(
    (sum, item) => sum + Number(item.profit || 0),
    0
  );

  const monthProfit = monthExecutions.reduce(
    (sum, item) => sum + Number(item.profit || 0),
    0
  );

  const totalProfit = executionList.reduce(
    (sum, item) => sum + Number(item.profit || 0),
    0
  );

  const totalOpenFee = tradeList.reduce(
    (sum, item) => sum + Number(item.open_fee || 0),
    0
  );

  const totalCloseFee = executionList.reduce(
    (sum, item) => sum + Number(item.close_fee || 0),
    0
  );

  const totalFee = totalOpenFee + totalCloseFee;

  const todayOpenFee = tradeList
    .filter((item) => item.open_date === today)
    .reduce((sum, item) => sum + Number(item.open_fee || 0), 0);

  const todayCloseFee = todayExecutions.reduce(
    (sum, item) => sum + Number(item.close_fee || 0),
    0
  );

  const todayFee = todayOpenFee + todayCloseFee;

  const activeQty = activeTrades.reduce(
    (sum, item) => sum + Number(item.remaining_qty || 0),
    0
  );

  const totalTradeCount = tradeList.length;
  const executionCount = executionList.length;

  const recentActive = activeTrades.slice(0, 3);
  const recentExecutions = executionList
    .slice()
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  return (
    <PageContainer>
      <PageTitle title={`${settings.symbol || "SPCX"} 做T控制台`} />

      <div className="space-y-5">
        <Card>
          <p className="text-sm font-bold text-gray-500">今日净利润</p>
          <p className={`mt-2 text-5xl font-extrabold ${profitColor(todayProfit)}`}>
            {money(todayProfit)}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href="/new"
              className="rounded-xl bg-green-600 p-4 text-center text-lg font-extrabold text-white active:scale-95"
            >
              ➕ 新建做T
            </Link>

            <Link
              href="/active"
              className="rounded-xl bg-orange-500 p-4 text-center text-lg font-extrabold text-white active:scale-95"
            >
              ⏳ 进行中
            </Link>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="text-sm font-bold text-gray-500">进行中</p>
            <p className="mt-2 text-3xl font-extrabold text-gray-950">
              {activeTrades.length}
            </p>
          </Card>

          <Card>
            <p className="text-sm font-bold text-gray-500">待完成股数</p>
            <p className="mt-2 text-3xl font-extrabold text-red-600">
              {activeQty}
            </p>
          </Card>

          <Card>
            <p className="text-sm font-bold text-gray-500">已完成</p>
            <p className="mt-2 text-3xl font-extrabold text-gray-950">
              {completedTrades.length}
            </p>
          </Card>

          <Card>
            <p className="text-sm font-bold text-gray-500">成交次数</p>
            <p className="mt-2 text-3xl font-extrabold text-gray-950">
              {executionCount}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="text-sm font-bold text-gray-500">本月净利润</p>
            <p className={`mt-2 text-2xl font-extrabold ${profitColor(monthProfit)}`}>
              {money(monthProfit)}
            </p>
          </Card>

          <Card>
            <p className="text-sm font-bold text-gray-500">累计净利润</p>
            <p className={`mt-2 text-2xl font-extrabold ${profitColor(totalProfit)}`}>
              {money(totalProfit)}
            </p>
          </Card>

          <Card>
            <p className="text-sm font-bold text-gray-500">今日手续费</p>
            <p className="mt-2 text-2xl font-extrabold text-gray-950">
              {usd(todayFee)}
            </p>
          </Card>

          <Card>
            <p className="text-sm font-bold text-gray-500">累计手续费</p>
            <p className="mt-2 text-2xl font-extrabold text-gray-950">
              {usd(totalFee)}
            </p>
          </Card>
        </div>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-gray-950">进行中订单</h3>
            <Link href="/active" className="font-bold text-blue-600">
              查看全部
            </Link>
          </div>

          {recentActive.length === 0 ? (
            <EmptyState text="暂无进行中订单" />
          ) : (
            <div className="space-y-3">
              {recentActive.map((trade) => (
                <div key={trade.id} className="rounded-xl bg-gray-50 p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-500">
                        T{String(trade.id).padStart(6, "0")}
                      </p>
                      <p className="font-extrabold text-gray-950">
                        {trade.direction} ｜ $
                        {Number(trade.open_price || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-500">剩余</p>
                      <p className="font-extrabold text-red-600">
                        {trade.remaining_qty} 股
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-gray-950">最近成交</h3>
            <Link href="/completed" className="font-bold text-blue-600">
              查看已完成
            </Link>
          </div>

          {recentExecutions.length === 0 ? (
            <EmptyState text="暂无成交记录" />
          ) : (
            <div className="space-y-3">
              {recentExecutions.map((item) => (
                <div key={item.id} className="rounded-xl bg-gray-50 p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-500">
                        {item.close_date} {item.close_time || ""}
                      </p>
                      <p className="font-extrabold text-gray-950">
                        成交 ${Number(item.close_price || 0).toFixed(2)} ×{" "}
                        {item.qty} 股
                      </p>
                      <p className="text-sm font-bold text-gray-500">
                        平仓手续费 ${Number(item.close_fee || 0).toFixed(2)}
                      </p>
                    </div>

                    <p
                      className={`text-right text-xl font-extrabold ${profitColor(
                        Number(item.profit || 0)
                      )}`}
                    >
                      {money(Number(item.profit || 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-extrabold text-gray-950">总览</h3>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-sm font-bold text-gray-500">总订单</p>
              <p className="mt-1 text-2xl font-extrabold">{totalTradeCount}</p>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-500">成交次数</p>
              <p className="mt-1 text-2xl font-extrabold">{executionCount}</p>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}