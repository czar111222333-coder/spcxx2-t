interface Props {
  qty: number;
  setQty: (value: number) => void;
  quickQty?: number[];
}

export default function QtySelector({
  qty,
  setQty,
  quickQty = [1, 3, 5, 7, 10],
}: Props) {
  function addQty(num: number) {
    setQty(qty + num);
  }

  function minusQty() {
    setQty(Math.max(0, qty - 1));
  }

  function inputQty(value: string) {
    const num = Number(value);

    if (isNaN(num)) return;

    setQty(Math.max(0, Math.floor(num)));
  }

  return (
    <div className="bg-gray-100 rounded-2xl p-4">
      <p className="text-gray-500 mb-3">
        快捷数量：点击会累加
      </p>

      <div className="grid grid-cols-5 gap-2 mb-5">
        {quickQty.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => addQty(num)}
            className="bg-white border rounded-xl py-4 text-2xl font-bold active:scale-95 transition"
          >
            {num}
          </button>
        ))}
      </div>

      <p className="text-gray-500 mb-2">
        当前数量
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={minusQty}
          className="w-16 h-16 bg-white border rounded-xl text-3xl font-bold active:scale-95 transition"
        >
          −
        </button>

        <div className="flex-1">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={qty}
            onChange={(e) => inputQty(e.target.value)}
            className="w-full h-16 bg-white border rounded-xl text-center text-4xl font-bold"
          />
        </div>

        <button
          type="button"
          onClick={() => addQty(1)}
          className="w-16 h-16 bg-white border rounded-xl text-3xl font-bold active:scale-95 transition"
        >
          +
        </button>
      </div>

      <p className="text-center text-gray-500 mt-3 text-sm">
        股数可直接输入，也可使用快捷按钮或 +/- 调整
      </p>
    </div>
  );
}