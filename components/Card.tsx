export default function Card({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <div className={`bg-white rounded-2xl p-4 shadow ${className}`}>
        {children}
      </div>
    );
  }