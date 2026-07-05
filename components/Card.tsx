export default function Card({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <div
        className={`rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/5 ${className}`}
      >
        {children}
      </div>
    );
  }