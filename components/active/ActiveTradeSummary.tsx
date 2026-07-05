interface Props {
    trade: any;
    isOpen: boolean;
    profit: number;
    fee: number;
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
  
  export default function ActiveTradeSummary({
    trade,
    isOpen,
    profit,
    fee,
  }: Props) {
    const totalQty = Number(trade.total_qty || 0);
    const remainingQty = Number(trade.remaining_qty || 0);
    const doneQty = totalQty - remainingQty;
    const progress = totalQty === 0 ? 0 : (doneQty / totalQty) * 100;
  
    return (
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-bold text-gray-600">订单编号</p>
            <p className="mt-1 text-3xl font-extrabold text-gray-950">
              T{String(trade.id).padStart(6, "0")}
            </p>
          </div>
  
          <div className="text-right">
            <p className={`text-2xl font-extrabold ${profitColor(profit)}`}>
              {money(profit)}
            </p>
            <p className="mt-1 text-sm font-bold text-gray-600">
              {isOpen ? "点击收起 ▲" : "点击展开 ▼"}
            </p>
          </div>
        </div>
  
        <div className="mt-4 flex items-center justify-between">
          <span
            className={`rounded-xl px-4 py-2 text-base font-extrabold ${
              trade.direction === "买入开仓"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {trade.direction}
          </span>
  
          <span className="rounded-xl bg-yellow-100 px-4 py-2 text-base font-extrabold text-yellow-700">
            进行中
          </span>
        </div>
  
        <div className="mt-4 grid grid-cols-2 gap-3 text-base font-bold text-gray-950">
          <p>开仓：${Number(trade.open_price || 0).toFixed(2)}</p>
          <p>总数：{totalQty} 股</p>
          <p>已完成：{doneQty} 股</p>
          <p className="text-red-600">剩余：{remainingQty} 股</p>
        </div>
  
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-sm font-bold text-gray-600">
            <span>完成进度</span>
            <span>
              {doneQty} / {totalQty} 股
            </span>
          </div>
  
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-green-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
  
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-sm font-bold text-gray-600">已实现利润</p>
            <p className={`mt-1 text-xl font-extrabold ${profitColor(profit)}`}>
              {money(profit)}
            </p>
          </div>
  
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-sm font-bold text-gray-600">累计手续费</p>
            <p className="mt-1 text-xl font-extrabold text-gray-950">
              ${fee.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  }