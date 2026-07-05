import Card from "@/components/Card";
import ActiveTradeSummary from "@/components/active/ActiveTradeSummary";
import CloseTradeForm from "@/components/active/CloseTradeForm";
import ExecutionList from "@/components/active/ExecutionList";

interface Props {
  trade: any;
  isOpen: boolean;
  qtyValue: string;
  saving: boolean;
  onToggle: () => void;
  onQtyChange: (value: string) => void;
  onQuickQty: (value: number) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onUndo: (execution: any) => void;
}

export default function ActiveTradeCard({
  trade,
  isOpen,
  qtyValue,
  saving,
  onToggle,
  onQtyChange,
  onQuickQty,
  onSubmit,
  onCancel,
  onUndo,
}: Props) {
  const executionProfit = (trade.executions || []).reduce(
    (sum: number, item: any) => sum + Number(item.profit || 0),
    0
  );

  const closeFee = (trade.executions || []).reduce(
    (sum: number, item: any) => sum + Number(item.close_fee || 0),
    0
  );

  const openFee = Number(trade.open_fee || 0);
  const totalFee = openFee + closeFee;

  return (
    <Card>
      <button type="button" onClick={onToggle} className="w-full text-left">
        <ActiveTradeSummary
          trade={trade}
          isOpen={isOpen}
          profit={executionProfit}
          fee={totalFee}
        />
      </button>

      {isOpen && (
        <>
          <CloseTradeForm
            trade={trade}
            qtyValue={qtyValue}
            saving={saving}
            onQtyChange={onQtyChange}
            onQuickQty={onQuickQty}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />

          <ExecutionList trade={trade} onUndo={onUndo} />
        </>
      )}
    </Card>
  );
}