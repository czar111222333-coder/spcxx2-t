interface Props {
    trade: any;
    qtyValue: string;
    saving: boolean;
    onQtyChange: (value: string) => void;
    onQuickQty: (value: number) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
  }
  
  function today() {
    return new Date().toISOString().slice(0, 10);
  }
  
  function nowTime() {
    return new Date().toTimeString().slice(0, 5);
  }
  
  export default function CloseTradeForm({
    trade,
    qtyValue,
    saving,
    onQtyChange,
    onQuickQty,
    onSubmit,
    onCancel,
  }: Props) {
    const remainingQty = Number(trade.remaining_qty || 0);
    const actionText = trade.direction === "买入开仓" ? "卖出" : "买入";
  
    const quickList = [1, 3, 5, 7, 10].filter((num) => num <= remainingQty);
  
    return (
      <form onSubmit={onSubmit} className="mt-5 border-t pt-5">
        <p className="mb-3 text-xl font-extrabold text-gray-950">
          {actionText}完成
        </p>
  
        <input type="hidden" name="close_date" value={today()} />
        <input type="hidden" name="close_time" value={nowTime()} />
  
        <input
          name="close_price"
          type="number"
          inputMode="decimal"
          step="0.00000001"
          required
          className="w-full rounded-xl border p-4 text-lg font-bold"
          placeholder={`${actionText}价格`}
        />
  
        <div className="mt-3 rounded-2xl bg-gray-100 p-4">
          <p className="mb-3 text-base font-bold text-gray-600">
            {actionText}数量
          </p>
  
          <div className="mb-3 grid grid-cols-6 gap-2">
            {quickList.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onQuickQty(num)}
                className="rounded-xl border bg-white py-3 text-lg font-extrabold active:scale-95"
              >
                {num}
              </button>
            ))}
  
            <button
              type="button"
              onClick={() => onQuickQty(remainingQty)}
              className="rounded-xl bg-gray-900 py-3 text-base font-extrabold text-white active:scale-95"
            >
              全部
            </button>
          </div>
  
          <input
            type="number"
            inputMode="numeric"
            value={qtyValue}
            onChange={(e) => onQtyChange(e.target.value)}
            className="h-16 w-full rounded-xl border bg-white text-center text-3xl font-extrabold"
            placeholder="输入股数"
          />
  
          <p className="mt-2 text-sm font-bold text-gray-500">
            剩余 {remainingQty} 股，保存时会校验数量
          </p>
        </div>
  
        <div className="mt-4 grid grid-cols-1 gap-3">
          <button
            disabled={saving}
            className={`w-full rounded-xl py-4 text-lg font-extrabold text-white ${
              saving ? "bg-gray-400" : "bg-green-600"
            }`}
          >
            {saving ? "正在保存..." : `保存${actionText}记录`}
          </button>
  
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl bg-red-600 py-4 text-lg font-extrabold text-white"
          >
            撤单
          </button>
        </div>
      </form>
    );
  }