import type { EntityState, HomeAssistant, Pool } from "./types";
export function isPool(entity: EntityState | undefined): boolean {
  return (
    entity?.attributes.integration === "coffee_tracker" &&
    typeof entity.attributes.pool_id === "string" &&
    "balance_minor" in entity.attributes
  );
}
export function poolFrom(entity: EntityState | undefined): Pool | null {
  if (!isPool(entity) || ["unknown", "unavailable"].includes(entity!.state))
    return null;
  const a = entity!.attributes;
  if (
    ![a.balance_minor, a.cup_price_minor, a.revision, a.coffee_count].every(
      Number.isSafeInteger,
    ) ||
    Number(a.cup_price_minor) <= 0 ||
    typeof a.currency !== "string"
  )
    return null;
  return {
    balance: Number(a.balance_minor),
    price: Number(a.cup_price_minor),
    revision: Number(a.revision),
    currency: a.currency,
    count: Number(a.coffee_count),
  };
}
export function parseAmount(value: string, positive = false): string | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^-?\d{1,12}(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const minor =
    Number(whole) * 100 +
    (normalized.startsWith("-") ? -1 : 1) * Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(minor) || (positive && minor <= 0)) return null;
  return `${minor < 0 ? "-" : ""}${Math.floor(Math.abs(minor) / 100)}.${String(Math.abs(minor) % 100).padStart(2, "0")}`;
}
export function money(minor: number, currency: string, locale = "en"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(2)} ${currency}`;
  }
}
export function decimal(minor: number): string {
  return (minor / 100).toFixed(2);
}
export async function service<T>(
  hass: HomeAssistant,
  name: string,
  data: Record<string, unknown>,
): Promise<T> {
  const result = hass.callWS
    ? await hass.callWS<unknown>({
        type: "call_service",
        domain: "coffee_tracker",
        service: name,
        service_data: data,
        return_response: true,
      })
    : await hass.callService(
        "coffee_tracker",
        name,
        data,
        undefined,
        false,
        true,
      );
  if (result && typeof result === "object" && "response" in result)
    return (result as { response: T }).response;
  return result as T;
}
export function requestId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `coffee-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}
export const actionLabels: Record<string, string> = {
  opening_balance: "Pool opened",
  add_funds: "Money added",
  buy_coffee: "Coffee purchased",
  set_balance: "Balance adjusted",
  set_price: "Cup price changed",
  undo: "Action undone",
};

/** Server-declared rejections did not commit; transport errors may have. */
export function isRejectedAction(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const detail = error as { code?: string; translation_key?: string };
  return (
    [
      "service_validation_error",
      "unauthorized",
      "invalid_format",
      "not_found",
      "unknown_command",
      "stale_revision",
      "invalid_amount",
      "invalid_request",
      "nothing_to_undo",
      "cannot_undo",
      "request_retired",
      "request_conflict",
      "confirmation_required",
      "missing_request_id",
    ].includes(detail.code || "") ||
    [
      "stale_revision",
      "invalid_amount",
      "invalid_request",
      "nothing_to_undo",
      "cannot_undo",
      "request_retired",
      "request_conflict",
      "confirmation_required",
      "missing_request_id",
    ].includes(detail.translation_key || "")
  );
}
