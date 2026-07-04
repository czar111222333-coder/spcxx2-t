import { supabase } from "@/lib/supabase";

function money(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

export default async function StatsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  const { data: executions } = await supabase.from("executions").select("*");

  const list = executions || [];

  const todayList = list.filter((item) => item.close_date === today);
  const monthList = list.filter((item) => item.close_date?.startsWith(month));

  const todayProfit = todayList.reduce(
    (sum, item) => sum + Number(item.profit),
    0
  );

  const monthProfit = monthList.reduce(
    (sum, item) => sum + Number(item.profit),
    0
  );

  const totalProfit = list.reduce(
    (sum, item) => sum + Number(item.profit),
    0
  );

  const todayFee = todayList.reduce(
    (sum, item) => sum + Number(item.fee),
    0
  );

  const totalFee = list.reduce(
    (sum, item) => sum + Number(item.fee),
    0
  );

  const winCount = list.filter((item) => Number(item.profit) > 0).length;
  const lossCount = list.filter((item) => Number(item.profit) < 0).length;
  const totalCount = list.length;

  const winRate = totalCount === 0 ? 0 : (winCount / totalCount) * 100;
  const avgProfit = totalCount === 0 ? 0 : totalProfit / totalCount;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">盈亏统计</h2>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow">
          <p className="text-gray-500">今日净利润</p>
          <p
            className={`text-5xl font-bold mt-3 ${
              todayProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {money(todayProfit)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <p className="text-gray-500">本月净利润</p>
          <p
            className={`text-5xl font-bold mt-3 ${
              monthProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {money(monthProfit)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <p className="text-gray-500">累计净利润</p>
          <p
            className={`text-5xl font-bold mt-3 ${
              totalProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {money(totalProfit)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <p className="text-gray-500">平均每次盈利</p>
          <p
            className={`text-5xl font-bold mt-3 ${
              avgProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {money(avgProfit)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-gray-500">完成次数</p>
          <p className="text-3xl font-bold mt-2">{totalCount}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-gray-500">盈利次数</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{winCount}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-gray-500">亏损次数</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{lossCount}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-gray-500">成功率</p>
          <p className="text-3xl font-bold mt-2">{winRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-xl font-bold mb-4">手续费统计</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">今日手续费</span>
              <span className="font-bold">${todayFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">累计手续费</span>
              <span className="font-bold">${totalFee.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-xl font-bold mb-4">交易结果</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">盈利次数</span>
              <span className="font-bold text-green-600">{winCount}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">亏损次数</span>
              <span className="font-bold text-red-600">{lossCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}