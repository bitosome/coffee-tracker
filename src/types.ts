export interface EntityState {
  entity_id?: string;
  state: string;
  attributes: Record<string, unknown>;
}
export interface HomeAssistant {
  states: Record<string, EntityState>;
  connected?: boolean;
  locale?: { language?: string };
  language?: string;
  callWS?<T>(message: Record<string, unknown>): Promise<T>;
  callService(
    domain: string,
    service: string,
    data: Record<string, unknown>,
    target?: unknown,
    notifyOnError?: boolean,
    returnResponse?: boolean,
  ): Promise<unknown>;
}
export interface CardConfig {
  type: string;
  entity: string;
  title?: string;
}
export interface Pool {
  balance: number;
  price: number;
  revision: number;
  currency: string;
  count: number;
}
export interface HistoryItem {
  id: string;
  sequence: number;
  kind: string;
  amount_minor: number;
  balance_minor: number;
  cup_price_minor: number;
  coffee_count: number;
  timestamp: string;
  actor: string;
  note?: string;
  undo_of?: string;
  undoable: boolean;
}
export interface HistoryResponse {
  items: HistoryItem[];
  has_more: boolean;
  next_before: number | null;
  revision: number;
}
export interface Receipt {
  balance_minor: number;
  cup_price_minor: number;
  coffee_count: number;
  currency: string;
  revision: number;
  transaction_id: string;
}
export type EditMode = "add" | "balance" | "price" | null;
