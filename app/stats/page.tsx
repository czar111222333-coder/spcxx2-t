export const dynamic = "force-dynamic";
export const revalidate = 0;

import { supabase } from "@/lib/supabase";
import PageContainer from "@/components/PageContainer";
import PageTitle from "@/components/PageTitle";
import EmptyState from "@/components/EmptyState";
import ProfitSummary from "@/components/stats/ProfitSummary";
import ResultSummary from "@/components/stats/ResultSummary";
import AmountSummary from "@/components/stats/AmountSummary";
import FeeSummary from "@/components/stats/FeeSummary";

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
          <ProfitSummary
            today={todayProfit}
            month={monthProfit}
            total={totalProfit}
            avg={avgProfit}
            avgPerShare={avgProfitPerShare}
          />

          <ResultSummary
            totalCount={totalCount}
            winCount={winCount}
            lossCount={lossCount}
            flatCount={flatCount}
            winRate={winRate}
            maxProfit={maxProfit}
            maxLoss={maxLoss}
          />

          <AmountSummary
            openAmount={openAmount}
            closeAmount={closeAmount}
            totalAmount={totalAmount}
            openQty={openQty}
            closeQty={closeQty}
            totalQty={totalQty}
          />

          <FeeSummary
            todayOpenFee={todayOpenFee}
            todayCloseFee={todayCloseFee}
            todayFee={todayFee}
            totalOpenFee={totalOpenFee}
            totalCloseFee={totalCloseFee}
            totalFee={totalFee}
          />
        </div>
      )}
    </PageContainer>
  );
}