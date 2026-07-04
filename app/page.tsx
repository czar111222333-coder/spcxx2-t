import { supabase } from "@/lib/supabase";

function money(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

export default async function Home() {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  const { data: trades } = await supabase.from("trades").select("*");
  const { data: executions } = await supabase.from("executions").select("*");

  const activeTrades = trades?.filter((item) => item.status === "进行中") || [];
  const completedTrades = trades?.filter((item) => item.status === "已完成") || [];

  const todayExecutions =
    executions?.filter((item) => item.close_date === today) || [];

  const monthExecutions =
    executions?.filter((item) => item.close_date?.startsWith(month)) || [];

  const todayProfit = todayExecutions.reduce(
    (sum, item) => sum + Number(item.profit),
    0
  );

  const monthProfit = monthExecutions.reduce(
    (sum, item) => sum + Number(item.profit),
    0
  );

  const totalProfit =
    executions?.reduce((sum, item) => sum + Number(item.profit), 0) || 0;

  const todayFee = todayExecutions.reduce(
    (sum, item) => sum + Number(item.fee),
    0
  );

  const totalFee =
    executions?.reduce((sum, item) => sum + Number(item.fee), 0) || 0;

  const activeQty = activeTrades.reduce(
    (sum, item) => sum + Number(item.remaining_qty),
    0
  );

  const completedCount = completedTrades.length;
  const executionCount = executions?.length || 0;

  const winCount =
    executions?.filter((item) => Number(item.profit) > 0).length || 0;

  const winRate =
    executionCount === 0 ? 0 : (winCount / executionCount) * 100;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold">SPCXX 做T控制台</h2>
        <p className="text-gray-500 mt-2">
          记录真实成交，统计净利润、手续费和做T进度
        </p>
      </div>

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
          <p className="text-gray-500">今日手续费</p>
          <p className="text-5xl font-bold mt-3">
            ${todayFee.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-gray-500">进行中订单</p>
          <p className="text-3xl font-bold mt-2">{activeTrades.length}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-gray-500">剩余待完成股数</p>
          <p className="text-3xl font-bold mt-2">{activeQty}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-gray-500">已完成订单</p>
          <p className="text-3xl font-bold mt-2">{completedCount}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-gray-500">成功率</p>
          <p className="text-3xl font-bold mt-2">{winRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-xl font-bold mb-4">费用统计</h3>

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
          <h3 className="text-xl font-bold mb-4">做T概览</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">完成次数</span>
              <span className="font-bold">{executionCount}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">盈利次数</span>
              <span className="font-bold text-green-600">{winCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}