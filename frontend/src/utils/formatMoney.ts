export const MONEY_CURRENCY_CODE = "Bs";

export function formatMoney(value?: number | null): string {
  const amount = Number(value ?? 0);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);

  return `${MONEY_CURRENCY_CODE} ${formatted}`;
}
