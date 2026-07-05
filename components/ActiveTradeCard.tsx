export default function PageContainer({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="p-4 max-w-5xl mx-auto">
        {children}
      </div>
    );
  }