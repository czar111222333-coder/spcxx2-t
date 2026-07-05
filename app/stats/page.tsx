export const dynamic = "force-dynamic";
export const revalidate = 0;

import { supabase } from "@/lib/supabase";
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

export default async function StatsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  const { data: trades } = await supabase.from("trades").select("*");

  const { data: executions } = await supabase
    .from("executions")
    .select("*")
    .order("close_date", { ascending: false });

  const tradeList = trades || [];
  const list = executions || [];

  const todayList = list.filter((item) => item.close_date === today);
  const monthList = list.filter((item) => item.close_date?.startsWith(month));

  const todayProfit = todayList.reduce(
    (sum, item) => sum + Number(item.profit || 0),
    0
  );

  const monthProfit = monthList.reduce(
    (sum, item) => sum + Number(item.profit || 0),
    0
  );

  const totalProfit = list.reduce(
    (sum, item) => sum + Number(item.profit || 0),
    0
  );

  const todayOpenFee = tradeList
    .filter((item) => item.open_date === today)
    .reduce((sum, item) => sum + Number(item.open_fee || 0), 0);

  const todayCloseFee = todayList.reduce(
    (sum, item) => sum + Number(item.close_fee || 0),
    0
  );

  const todayFee = todayOpenFee + todayCloseFee;

  const totalOpenFee = tradeList.reduce(
    (sum, item) => sum + Number(item.open_fee || 0),
    0
  );

  const totalCloseFee = list.reduce(
    (sum, item) => sum + Number(item.close_fee || 0),
    0
  );

  const totalFee = totalOpenFee + totalCloseFee;

  const openAmount = tradeList.reduce(
    (sum, item) =>
      sum + Number(item.open_price || 0) * Number(item.total_qty || 0),
    0
  );

  const closeAmount = list.reduce(
    (sum, item) =>
      sum + Number(item.close_price || 0) * Number(item.qty || 0),
    0
  );

  const totalAmount = openAmount + closeAmount;

  const openQty = tradeList.reduce(
    (sum, item) => sum + Number(item.total_qty || 0),
    0
  );

  const closeQty = list.reduce((sum, item) => sum + Number(item.qty || 0), 0);

  const totalQty = openQty + closeQty;

  const winCount = list.filter((item) => Number(item.profit || 0) > 0).length;
  const lossCount = list.filter((item) => Number(item.profit || 0) < 0).length;
  const flatCount = list.filter((item) => Number(item.profit || 0) === 0).length;
  const totalCount = list.length;

  const winRate = totalCount === 0 ? 0 : (winCount / totalCount) * 100;
  const avgProfit = totalCount === 0 ? 0 : totalProfit / totalCount;
  const avgProfitPerShare = closeQty === 0 ? 0 : totalProfit / closeQty;

  const maxProfit =
    list.length === 0
      ? 0
      : Math.max(...list.map((item) => Number(item.profit || 0)));

  const maxLoss =
    list.length === 0
      ? 0
      : Math.min(...list.map((item) => Number(item.profit || 0)));

  return (
    <PageContainer>
      <PageTitle title="盈亏统计" />

      {tradeList.length === 0 && totalCount === 0 ? (
        <EmptyState text="暂无统计数据" />
      ) : (
        <div className="space-y-5">
          <Card>
            <p className="text-sm font-bold text-gray-500">今日净利润</p>
            <p className={`mt-2 text-4xl font-extrabold ${profitColor(todayProfit)}`}>
              {money(todayProfit)}
            </p>
            <p className="mt-2 text-xs font-bold text-gray-400">日期：{today}</p>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <p className="text-sm font-bold text-gray-500">本月净利润</p>
              <p
                className={`mt-2 text-2xl font-extrabold ${profitColor(
                  monthProfit
                )}`}
              >
                {money(monthProfit)}
              </p>
            </Card>

            <Card>
              <p className="text-sm font-bold text-gray-500">累计净利润</p>
              <p
                className={`mt-2 text-2xl font-extrabold ${profitColor(
                  totalProfit
                )}`}
              >
                {money(totalProfit)}
              </p>
            </Card>

            <Card>
              <p className="text-sm font-bold text-gray-500">平均每次盈利</p>
              <p
                className={`mt-2 text-2xl font-extrabold ${profitColor(
                  avgProfit
                )}`}
              >
                {money(avgProfit)}
              </p>
            </Card>

            <Card>
              <p className="text-sm font-bold text-gray-500">平均每股盈利</p>
              <p
                className={`mt-2 text-2xl font-extrabold ${profitColor(
                  avgProfitPerShare
                )}`}
              >
                {money(avgProfitPerShare)}
              </p>
            </Card>
          </div>

          <Card>
            <h3 className="mb-4 text-lg font-extrabold text-gray-900">
              交易结果
            </h3>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-xs font-bold text-gray-500">完成</p>
                <p className="mt-1 text-xl font-extrabold">{totalCount}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500">盈利</p>
                <p className="mt-1 text-xl font-extrabold text-green-600">
                  {winCount}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500">亏损</p>
                <p className="mt-1 text-xl font-extrabold text-red-600">
                  {lossCount}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500">持平</p>
                <p className="mt-1 text-xl font-extrabold text-gray-700">
                  {flatCount}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-sm font-bold text-gray-500">成功率</p>
              <p className="mt-1 text-3xl font-extrabold text-gray-950">
                {winRate.toFixed(1)}%
              </p>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-extrabold text-gray-900">
              最大盈亏
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm font-bold text-gray-500">最大盈利</p>
                <p
                  className={`mt-2 text-2xl font-extrabold ${profitColor(
                    maxProfit
                  )}`}
                >
                  {money(maxProfit)}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm font-bold text-gray-500">最大亏损</p>
                <p
                  className={`mt-2 text-2xl font-extrabold ${profitColor(
                    maxLoss
                  )}`}
                >
                  {money(maxLoss)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-extrabold text-gray-900">
              成交统计
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">
                  开仓成交额
                </span>
                <span className="font-extrabold text-gray-900">
                  {usd(openAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">
                  平仓成交额
                </span>
                <span className="font-extrabold text-gray-900">
                  {usd(closeAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-bold text-gray-500">
                  累计成交额
                </span>
                <span className="font-extrabold text-gray-900">
                  {usd(totalAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">
                  开仓股数
                </span>
                <span className="font-extrabold text-gray-900">
                  {openQty} 股
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">
                  平仓股数
                </span>
                <span className="font-extrabold text-gray-900">
                  {closeQty} 股
                </span>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-bold text-gray-500">
                  累计成交股数
                </span>
                <span className="font-extrabold text-gray-900">
                  {totalQty} 股
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-extrabold text-gray-900">
              手续费统计
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">
                  今日开仓手续费
                </span>
                <span className="font-extrabold text-gray-900">
                  {usd(todayOpenFee)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">
                  今日平仓手续费
                </span>
                <span className="font-extrabold text-gray-900">
                  {usd(todayCloseFee)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-bold text-gray-500">今日手续费</span>
                <span className="font-extrabold text-gray-900">
                  {usd(todayFee)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">
                  累计开仓手续费
                </span>
                <span className="font-extrabold text-gray-900">
                  {usd(totalOpenFee)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">
                  累计平仓手续费
                </span>
                <span className="font-extrabold text-gray-900">
                  {usd(totalCloseFee)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-bold text-gray-500">累计手续费</span>
                <span className="font-extrabold text-gray-900">
                  {usd(totalFee)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}