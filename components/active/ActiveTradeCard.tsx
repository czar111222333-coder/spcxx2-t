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
  const profit = (trade.executions || []).reduce(
    (sum: number, item: any) => sum + Number(item.profit || 0),
    0
  );

  const fee = (trade.executions || []).reduce(
    (sum: number, item: any) => sum + Number(item.fee || 0),
    0
  );

  return (
    <Card>
      <button type="button" onClick={onToggle} className="w-full text-left">
        <ActiveTradeSummary
          trade={trade}
          isOpen={isOpen}
          profit={profit}
          fee={fee}
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