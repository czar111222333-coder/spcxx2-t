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
  
    return (
      <div className="bg-gray-100 rounded-2xl p-4">
        <p className="text-gray-500 mb-3">快捷数量：点击会累加</p>
  
        <div className="grid grid-cols-5 gap-2 mb-4">
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
  
        <p className="text-gray-500 mb-2">当前数量</p>
  
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={minusQty}
            className="w-16 h-16 bg-white rounded-xl text-3xl font-bold border active:scale-95 transition"
          >
            -
          </button>
  
          <div className="w-40 bg-white border rounded-xl p-4 text-center">
            <span className="text-5xl font-bold">{qty}</span>
            <span className="text-xl font-bold ml-1">股</span>
          </div>
  
          <button
            type="button"
            onClick={() => addQty(1)}
            className="w-16 h-16 bg-white rounded-xl text-3xl font-bold border active:scale-95 transition"
          >
            +
          </button>
        </div>
  
        <button
          type="button"
          onClick={() => setQty(0)}
          className="w-full bg-gray-700 text-white rounded-xl py-3 font-bold mt-4 active:scale-95 transition"
        >
          清空数量
        </button>
      </div>
    );
  }