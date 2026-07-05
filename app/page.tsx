export const dynamic = "force-dynamic";
export const revalidate = 0;
import { supabase } from "@/lib/supabase";
import Link from "next/link";
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

export default async function Home() {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

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

  const todayFee = todayExecutions.reduce(
    (sum, item) => sum + Number(item.fee || 0),
    0
  );

  const totalFee = executionList.reduce(
    (sum, item) => sum + Number(item.fee || 0),
    0
  );

  const activeQty = activeTrades.reduce(
    (sum, item) => sum + Number(item.remaining_qty || 0),
    0
  );

  const executionCount = executionList.length;
  const winCount = executionList.filter(
    (item) => Number(item.profit || 0) > 0
  ).length;

  const winRate =
    executionCount === 0 ? 0 : (winCount / executionCount) * 100;

  const recentActive = activeTrades.slice(0, 3);
  const recentExecutions = executionList
    .slice()
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  return (
    <PageContainer>
      <PageTitle title="SPCXX 做T控制台" />

      <div className="space-y-5">
        <Card>
          <p className="text-sm text-gray-500">今日净利润</p>
          <p className={`mt-2 text-4xl font-bold ${profitColor(todayProfit)}`}>
            {money(todayProfit)}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href="/new"
              className="rounded-xl bg-green-600 p-4 text-center text-lg font-bold text-white active:scale-95"
            >
              ➕ 新建做T
            </Link>

            <Link
              href="/active"
              className="rounded-xl bg-orange-500 p-4 text-center text-lg font-bold text-white active:scale-95"
            >
              ⏳ 进行中
            </Link>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="text-sm text-gray-500">本月净利润</p>
            <p className={`mt-2 text-2xl font-bold ${profitColor(monthProfit)}`}>
              {money(monthProfit)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">累计净利润</p>
            <p className={`mt-2 text-2xl font-bold ${profitColor(totalProfit)}`}>
              {money(totalProfit)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">进行中订单</p>
            <p className="mt-2 text-2xl font-bold">{activeTrades.length}</p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">待完成股数</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{activeQty}</p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">已完成订单</p>
            <p className="mt-2 text-2xl font-bold">{completedTrades.length}</p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">成功率</p>
            <p className="mt-2 text-2xl font-bold">{winRate.toFixed(1)}%</p>
          </Card>
        </div>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">进行中订单</h3>
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
                      <p className="text-sm text-gray-500">T{trade.id}</p>
                      <p className="font-bold">
                        {trade.direction} ｜ $
                        {Number(trade.open_price || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">剩余</p>
                      <p className="font-bold text-red-600">
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
            <h3 className="text-lg font-bold">最近成交</h3>
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
                      <p className="text-sm text-gray-500">
                        {item.close_date} {item.close_time || ""}
                      </p>
                      <p className="font-bold">
                        成交 ${Number(item.close_price || 0).toFixed(2)} ×{" "}
                        {item.qty} 股
                      </p>
                      <p className="text-sm text-gray-500">
                        手续费 ${Number(item.fee || 0).toFixed(2)}
                      </p>
                    </div>

                    <p
                      className={`text-right text-xl font-bold ${profitColor(
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

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="text-sm text-gray-500">今日手续费</p>
            <p className="mt-2 text-2xl font-bold">${todayFee.toFixed(2)}</p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">累计手续费</p>
            <p className="mt-2 text-2xl font-bold">${totalFee.toFixed(2)}</p>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}