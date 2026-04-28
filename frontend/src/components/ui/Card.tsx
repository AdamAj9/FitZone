import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl bg-white p-6 shadow-sm ${className}`}
      {...rest}
    />
  );
}
