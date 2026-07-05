interface Props {
    trade: any;
    onUndo: (execution: any) => void;
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
  
  export default function ExecutionList({ trade, onUndo }: Props) {
    const actionText = trade.direction === "买入开仓" ? "卖出" : "买入";
    const executions = trade.executions || [];
  
    if (executions.length === 0) return null;
  
    return (
      <div className="mt-5 border-t pt-5">
        <p className="mb-3 text-xl font-extrabold text-gray-950">最近成交</p>
  
        <div className="space-y-3">
          {executions.map((item: any, index: number) => {
            const profit = Number(item.profit || 0);
            const fee = Number(item.fee || 0);
            const price = Number(item.close_price || 0);
  
            return (
              <div key={item.id} className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-extrabold text-gray-950">
                      {index + 1}. {actionText} {item.qty} 股
                    </p>
  
                    <p className="mt-1 text-lg font-extrabold text-gray-900">
                      @ ${price.toFixed(2)}
                    </p>
                  </div>
  
                  <p className={`text-2xl font-extrabold ${profitColor(profit)}`}>
                    {money(profit)}
                  </p>
                </div>
  
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-600">
                    手续费 ${fee.toFixed(2)}
                  </p>
  
                  <button
                    type="button"
                    onClick={() => onUndo(item)}
                    className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-bold text-white active:scale-95"
                  >
                    ↩ 撤销
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }