import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export function PostTitle({ children }: Props) {
  return (
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-tight mb-8 text-center md:text-left">
      {children}
    </h2>
  );
}
