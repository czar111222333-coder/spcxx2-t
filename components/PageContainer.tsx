export default function PageContainer({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-5 text-gray-900">
        {children}
      </main>
    );
  }