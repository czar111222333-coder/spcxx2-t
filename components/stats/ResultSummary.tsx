import Card from "@/components/Card";

interface Props {
  totalCount: number;
  winCount: number;
  lossCount: number;
  flatCount: number;
  winRate: number;
  maxProfit: number;
  maxLoss: number;
}

function money(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function profitColor(value: number) {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "text-gray-900";
}

export default function ResultSummary({
  totalCount,
  winCount,
  lossCount,
  flatCount,
  winRate,
  maxProfit,
  maxLoss,
}: Props) {
  return (
    <>
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
    </>
  );
}