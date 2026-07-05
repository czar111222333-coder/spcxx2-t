import Card from "@/components/Card";

interface Props {
  openAmount: number;
  closeAmount: number;
  totalAmount: number;
  openQty: number;
  closeQty: number;
  totalQty: number;
}

function usd(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function AmountSummary({
  openAmount,
  closeAmount,
  totalAmount,
  openQty,
  closeQty,
  totalQty,
}: Props) {
  return (
    <Card>
      <h3 className="mb-4 text-lg font-extrabold text-gray-900">成交统计</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-500">开仓成交额</span>
          <span className="font-extrabold text-gray-900">{usd(openAmount)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-500">平仓成交额</span>
          <span className="font-extrabold text-gray-900">{usd(closeAmount)}</span>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm font-bold text-gray-500">累计成交额</span>
          <span className="font-extrabold text-gray-900">{usd(totalAmount)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-500">开仓股数</span>
          <span className="font-extrabold text-gray-900">{openQty} 股</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-500">平仓股数</span>
          <span className="font-extrabold text-gray-900">{closeQty} 股</span>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm font-bold text-gray-500">累计成交股数</span>
          <span className="font-extrabold text-gray-900">{totalQty} 股</span>
        </div>
      </div>
    </Card>
  );
}