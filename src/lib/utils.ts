import { User } from "@clerk/nextjs/server";
import { UserResource } from "@clerk/types";
import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatSalary(salaryMin?: number | null, salaryMax?: number | null, salary?: number | null) {
  // If we have both min and max, show as range
  if (salaryMin !== null && salaryMin !== undefined &&
    salaryMax !== null && salaryMax !== undefined) {
    // Check if both are 0, return "Competitive"
    if (salaryMin === 0 && salaryMax === 0) {
      return "Competitive";
    }
    if (salaryMin === salaryMax) {
      return salaryMin === 0 ? "Competitive" : formatMoney(salaryMin);
    }
    return `${formatMoney(salaryMin)} - ${formatMoney(salaryMax)}`;
  }

  // If we have only one of the range values
  if (salaryMin !== null && salaryMin !== undefined) {
    return salaryMin === 0 ? "Competitive" : `From ${formatMoney(salaryMin)}`;
  }

  if (salaryMax !== null && salaryMax !== undefined) {
    return salaryMax === 0 ? "Competitive" : `Up to ${formatMoney(salaryMax)}`;
  }

  // Fallback to the old single salary field
  if (salary !== null && salary !== undefined) {
    return salary === 0 ? "Competitive" : formatMoney(salary);
  }

  return "Competitive";
}

export function relativeDate(from: Date) {
  return formatDistanceToNowStrict(from, { addSuffix: true });
}

export function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

export function isAdmin(user: UserResource | User) {
  return user.publicMetadata?.role === "admin";
}
