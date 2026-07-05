interface Props {
    title: string;
    subtitle?: string;
  }
  
  export default function PageTitle({ title, subtitle }: Props) {
    return (
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold leading-tight text-gray-950">
          {title}
        </h1>
  
        {subtitle && (
          <p className="mt-2 text-base font-medium leading-relaxed text-gray-600">
            {subtitle}
          </p>
        )}
      </div>
    );
  }