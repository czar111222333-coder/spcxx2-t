import Card from "@/components/Card";

interface Props {
  today: number;
  month: number;
  total: number;
  avg: number;
  avgPerShare: number;
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

export default function ProfitSummary({
  today,
  month,
  total,
  avg,
  avgPerShare,
}: Props) {
  return (
    <>
      <Card>
        <p className="text-sm font-bold text-gray-500">今日净利润</p>

        <p className={`mt-2 text-4xl font-extrabold ${profitColor(today)}`}>
          {money(today)}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-sm font-bold text-gray-500">本月净利润</p>

          <p className={`mt-2 text-2xl font-extrabold ${profitColor(month)}`}>
            {money(month)}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-bold text-gray-500">累计净利润</p>

          <p className={`mt-2 text-2xl font-extrabold ${profitColor(total)}`}>
            {money(total)}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-bold text-gray-500">平均每次盈利</p>

          <p className={`mt-2 text-2xl font-extrabold ${profitColor(avg)}`}>
            {money(avg)}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-bold text-gray-500">平均每股盈利</p>

          <p
            className={`mt-2 text-2xl font-extrabold ${profitColor(
              avgPerShare
            )}`}
          >
            {money(avgPerShare)}
          </p>
        </Card>
      </div>
    </>
  );
}