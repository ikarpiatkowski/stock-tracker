import { clsx, type ClassValue } from "https://esm.sh/clsx@2.0.0";
import { twMerge } from "https://esm.sh/tailwind-merge@1.14.0";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
