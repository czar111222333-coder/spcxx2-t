import { supabase } from "@/lib/supabase";
import Link from "next/link";

function money(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
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
    (sum, item) => sum + Number(item.profit),
    0
  );

  const monthProfit = monthExecutions.reduce(
    (sum, item) => sum + Number(item.profit),
    0
  );

  const totalProfit = executionList.reduce(
    (sum, item) => sum + Number(item.profit),
    0
  );

  const todayFee = todayExecutions.reduce(
    (sum, item) => sum + Number(item.fee),
    0
  );

  const totalFee = executionList.reduce(
    (sum, item) => sum + Number(item.fee),
    0
  );

  const activeQty = activeTrades.reduce(
    (sum, item) => sum + Number(item.remaining_qty),
    0
  );

  const executionCount = executionList.length;
  const winCount = executionList.filter(
    (item) => Number(item.profit) > 0
  ).length;

  const winRate =
    executionCount === 0 ? 0 : (winCount / executionCount) * 100;

  const recentActive = activeTrades.slice(0, 3);
  const recentExecutions = executionList
    .slice()
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-3xl font-bold leading-tight">SPCXX 做T控制台</h2>
        <p className="text-gray-500 mt-1 text-sm">
          今日收益、进行中订单和最近成交
        </p>
      </section>

      <section className="bg-white rounded-2xl p-5 shadow">
        <p className="text-gray-500">今日净利润</p>
        <p
          className={`text-5xl font-bold mt-2 leading-tight break-all ${
            todayProfit >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {money(todayProfit)}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <Link
            href="/new"
            className="bg-green-600 text-white rounded-xl p-4 text-center font-bold text-lg active:scale-95 transition"
          >
            ➕ 新建做T
          </Link>

          <Link
            href="/active"
            className="bg-orange-500 text-white rounded-xl p-4 text-center font-bold text-lg active:scale-95 transition"
          >
            ⏳ 进行中
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow overflow-hidden">
          <p className="text-gray-500 text-sm">本月净利润</p>
          <p
            className={`text-3xl font-bold mt-2 leading-tight break-all ${
              monthProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {money(monthProfit)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow overflow-hidden">
          <p className="text-gray-500 text-sm">累计净利润</p>
          <p
            className={`text-3xl font-bold mt-2 leading-tight break-all ${
              totalProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {money(totalProfit)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-gray-500 text-sm">进行中订单</p>
          <p className="text-3xl font-bold mt-2">{activeTrades.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-gray-500 text-sm">剩余待完成股数</p>
          <p className="text-3xl font-bold mt-2 text-red-600">{activeQty}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-gray-500 text-sm">已完成订单</p>
          <p className="text-3xl font-bold mt-2">{completedTrades.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-gray-500 text-sm">成功率</p>
          <p className="text-3xl font-bold mt-2">{winRate.toFixed(1)}%</p>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-5 shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">进行中订单</h3>
          <Link href="/active" className="text-blue-600 font-bold">
            查看全部
          </Link>
        </div>

        <div className="space-y-3">
          {recentActive.map((trade) => (
            <div key={trade.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">T{trade.id}</p>
                  <p className="font-bold">
                    {trade.direction} ｜ ${Number(trade.open_price).toFixed(2)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-gray-500 text-sm">剩余</p>
                  <p className="font-bold text-red-600">
                    {trade.remaining_qty} 股
                  </p>
                </div>
              </div>
            </div>
          ))}

          {recentActive.length === 0 && (
            <p className="text-gray-500 text-center py-4">暂无进行中订单</p>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl p-5 shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">最近成交</h3>
          <Link href="/completed" className="text-blue-600 font-bold">
            查看已完成
          </Link>
        </div>

        <div className="space-y-3">
          {recentExecutions.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="text-gray-500 text-sm">
                    {item.close_date} {item.close_time || ""}
                  </p>
                  <p className="font-bold">
                    成交 ${Number(item.close_price).toFixed(2)} × {item.qty} 股
                  </p>
                  <p className="text-gray-500 text-sm">
                    手续费 ${Number(item.fee).toFixed(2)}
                  </p>
                </div>

                <p
                  className={`text-xl font-bold text-right ${
                    Number(item.profit) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {money(Number(item.profit))}
                </p>
              </div>
            </div>
          ))}

          {recentExecutions.length === 0 && (
            <p className="text-gray-500 text-center py-4">暂无成交记录</p>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-gray-500 text-sm">今日手续费</p>
          <p className="text-2xl font-bold mt-2">${todayFee.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-gray-500 text-sm">累计手续费</p>
          <p className="text-2xl font-bold mt-2">${totalFee.toFixed(2)}</p>
        </div>
      </section>
    </div>
  );
}