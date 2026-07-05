interface Props {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit";
    disabled?: boolean;
    color?: "green" | "red" | "blue" | "gray";
    className?: string;
  }
  
  export default function PrimaryButton({
    children,
    onClick,
    type = "button",
    disabled = false,
    color = "green",
    className = "",
  }: Props) {
    const colors = {
      green: "bg-green-600 hover:bg-green-700",
      red: "bg-red-600 hover:bg-red-700",
      blue: "bg-blue-600 hover:bg-blue-700",
      gray: "bg-gray-600 hover:bg-gray-700",
    };
  
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`
          w-full
          rounded-2xl
          py-4
          text-xl
          font-bold
          text-white
          transition
          active:scale-95
          disabled:opacity-50
          ${colors[color]}
          ${className}
        `}
      >
        {children}
      </button>
    );
  }