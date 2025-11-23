import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function formatSnowfall(inches: number): string {
  if (inches === 0) return 'No new snow';
  return `${inches}" new`;
}

export function formatDistance(miles: number): string {
  return `${miles} mi`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
