interface Props {
    text: string;
  }
  
  export default function EmptyState({ text }: Props) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
        {text}
      </div>
    );
  }