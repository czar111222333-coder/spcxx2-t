import Card from "@/components/Card";

interface Props {
  todayOpenFee: number;
  todayCloseFee: number;
  todayFee: number;
  totalOpenFee: number;
  totalCloseFee: number;
  totalFee: number;
}

function usd(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function FeeSummary({
  todayOpenFee,
  todayCloseFee,
  todayFee,
  totalOpenFee,
  totalCloseFee,
  totalFee,
}: Props) {
  return (
    <Card>
      <h3 className="mb-4 text-lg font-extrabold text-gray-900">手续费统计</h3>

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
          <span className="font-extrabold text-gray-900">{usd(todayFee)}</span>
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
          <span className="font-extrabold text-gray-900">{usd(totalFee)}</span>
        </div>
      </div>
    </Card>
  );
}