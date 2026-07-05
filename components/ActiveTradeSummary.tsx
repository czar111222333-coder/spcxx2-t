interface Props {
    direction: string;
    status: string;
    openPrice: number;
    totalQty: number;
    completedQty: number;
    remainingQty: number;
    profit: number;
    fee: number;
  }
  
  function money(value: number) {
    const sign = value >= 0 ? "+" : "-";
    return `${sign}$${Math.abs(value).toFixed(2)}`;
  }
  
  export default function ActiveTradeSummary({
    direction,
    status,
    openPrice,
    totalQty,
    completedQty,
    remainingQty,
    profit,
    fee,
  }: Props) {
    const progress =
      totalQty === 0 ? 0 : (completedQty / totalQty) * 100;
  
    return (
      <div className="space-y-4">
  
        {/* 状态 */}
        <div className="flex justify-between">
  
          <span
            className={`rounded-xl px-4 py-2 font-bold text-lg ${
              direction === "买入开仓"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {direction}
          </span>
  
          <span className="rounded-xl bg-yellow-100 text-yellow-700 px-4 py-2 font-bold text-lg">
            {status}
          </span>
  
        </div>
  
        {/* 数据 */}
        <div className="grid grid-cols-2 gap-3 font-bold text-lg">
  
          <div>
            开仓：${openPrice.toFixed(2)}
          </div>
  
          <div>
            总数：{totalQty} 股
          </div>
  
          <div>
            已完成：{completedQty} 股
          </div>
  
          <div className="text-red-600">
            剩余：{remainingQty} 股
          </div>
  
        </div>
  
        {/* 进度 */}
        <div>
  
          <div className="flex justify-between text-gray-600 text-sm font-bold">
  
            <span>完成进度</span>
  
            <span>
              {completedQty}/{totalQty} 股
            </span>
  
          </div>
  
          <div className="h-3 rounded-full bg-gray-200 mt-2">
  
            <div
              className="h-3 rounded-full bg-green-500"
              style={{
                width: `${progress}%`,
              }}
            />
  
          </div>
  
        </div>
  
        {/* 利润 */}
        <div className="grid grid-cols-2 gap-3">
  
          <div className="bg-gray-50 rounded-xl p-4">
  
            <div className="text-gray-500 font-bold">
              已实现利润
            </div>
  
            <div
              className={`text-3xl font-extrabold mt-1 ${
                profit >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {money(profit)}
            </div>
  
          </div>
  
          <div className="bg-gray-50 rounded-xl p-4">
  
            <div className="text-gray-500 font-bold">
              累计手续费
            </div>
  
            <div className="text-3xl font-extrabold mt-1">
              ${fee.toFixed(2)}
            </div>
  
          </div>
  
        </div>
  
      </div>
    );
  }