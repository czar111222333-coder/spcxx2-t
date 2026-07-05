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
    if (value === "") {
      setQty(0);
      return;
    }

    const num = Number(value);
    if (isNaN(num)) return;

    setQty(Math.max(0, Math.floor(num)));
  }

  return (
    <div className="rounded-2xl bg-gray-100 p-4">
      <p className="mb-3 text-base font-bold text-gray-600">
        快捷数量：点击会累加
      </p>

      <div className="mb-5 grid grid-cols-5 gap-2">
        {quickQty.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => addQty(num)}
            className="rounded-xl border bg-white py-4 text-2xl font-extrabold active:scale-95"
          >
            {num}
          </button>
        ))}
      </div>

      <p className="mb-2 text-base font-bold text-gray-600">当前数量</p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={minusQty}
          className="h-16 w-16 rounded-xl border bg-white text-3xl font-extrabold active:scale-95"
        >
          −
        </button>

        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={qty === 0 ? "" : qty}
          onChange={(e) => inputQty(e.target.value)}
          placeholder="股数"
          className="h-16 flex-1 rounded-xl border bg-white text-center text-3xl font-extrabold text-gray-950 placeholder:text-gray-300"
        />

        <button
          type="button"
          onClick={() => addQty(1)}
          className="h-16 w-16 rounded-xl border bg-white text-3xl font-extrabold active:scale-95"
        >
          +
        </button>
      </div>
    </div>
  );
}