export const Button = ({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) => {
  return (
    <a
      href={href}
      className={`bg-white text-black px-6 py-4 rounded-md ${className}`}
    >
      {children}
    </a>
  );
};

export const TransparentButton = ({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) => {
  return (
    <a
      href={href}
      className={`text-white bg-white/10 px-6 py-4 rounded-md backdrop-blur-sm ${className}`}
    >
      {children}
    </a>
  );
};
