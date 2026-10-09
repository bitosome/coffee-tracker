// Synthetic demo only: no credentials, Home Assistant connection, or real money.
export const entity = "sensor.coffee_pool_balance";
export const mockConfig = {
  type: "custom:coffee-tracker-card",
  entity,
  title: "Coffee pool",
};
export function createMockPool({
  balance = 2450,
  price = 150,
  empty = false,
  delay = 100,
  failOnce = false,
} = {}) {
  let revision = 1,
    count = empty ? 0 : 7,
    currentBalance = empty ? 0 : balance,
    currentPrice = price,
    sequence = 0,
    fail = failOnce;
  let actions = [],
    receipts = new Map(),
    retiredRequests = new Set(),
    listeners = new Set();
  const calls = [];
  function event(kind, delta, actor = "Alex", note = "", undo_of) {
    const item = {
      id: `demo-${++sequence}`,
      sequence,
      kind,
      amount_minor: delta,
      balance_minor: currentBalance,
      cup_price_minor: currentPrice,
      coffee_count: count,
      timestamp: new Date(Date.now() - (9 - sequence) * 36e5).toISOString(),
      actor,
      note,
      ...(undo_of ? { undo_of } : {}),
    };
    actions.unshift(item);
    return item;
  }
  if (!empty) {
    currentBalance = 2500;
    event("opening_balance", 2500, "Alex");
    currentBalance = 3500;
    event("add_funds", 1000, "Sam");
    for (let i = 0; i < 7; i++) {
      currentBalance -= 150;
      event("buy_coffee", -150, i % 2 ? "Sam" : "Alex");
    }
    currentBalance = balance;
    actions[0].balance_minor = balance;
  }
  function state() {
    return {
      entity_id: entity,
      state: (currentBalance / 100).toFixed(2),
      attributes: {
        friendly_name: "Coffee pool balance",
        integration: "coffee_tracker",
        pool_id: "synthetic-demo",
        currency: "EUR",
        supports_reset: true,
        balance_minor: currentBalance,
        cup_price_minor: currentPrice,
        revision,
        coffee_count: count,
        price_entity_id: "number.coffee_pool_cup_price",
        coffee_button_entity_id: "button.coffee_pool_buy_coffee",
      },
    };
  }
  function latestFinancial() {
    return actions.find((item) => item.kind !== "set_price");
  }
  function history() {
    const latest = latestFinancial();
    return actions.map((item) => ({
      ...item,
      undoable:
        item.id === latest?.id &&
        ["add_funds", "buy_coffee", "set_balance"].includes(item.kind),
    }));
  }
  function publish() {
    listeners.forEach((listener) => listener(hass()));
  }
  async function callService(domain, name, data) {
    calls.push({ domain, name, data: structuredClone(data) });
    await new Promise((resolve) => setTimeout(resolve, delay));
    if (name === "get_history") {
      const list = history().filter(
          (item) => !data.before || item.sequence < data.before,
        ),
        items = list.slice(0, data.limit || 20);
      return {
        response: {
          items,
          has_more: list.length > items.length,
          next_before: items.at(-1)?.sequence || null,
          revision,
        },
      };
    }
    if (retiredRequests.has(data.request_id))
      throw {
        code: "service_validation_error",
        message:
          "This request belongs to a deleted ledger. Review the current pool.",
      };
    if (receipts.has(data.request_id))
      return { response: receipts.get(data.request_id) };
    if (fail) {
      fail = false;
      throw new Error("Connection interrupted. Try again.");
    }
    if (
      data.expected_revision !== undefined &&
      data.expected_revision !== revision
    )
      throw {
        code: "service_validation_error",
        message: "The pool changed. Review the latest balance.",
      };
    if (name === "reset_ledger") {
      if (
        data.confirmed !== true ||
        !data.request_id ||
        data.expected_revision === undefined
      )
        throw {
          code: "service_validation_error",
          message: "Reset requires confirmation and the current revision.",
        };
      for (const id of receipts.keys()) retiredRequests.add(id);
      receipts.clear();
      actions = [];
      currentBalance = 0;
      count = 0;
      revision++;
      const receipt = {
        balance_minor: 0,
        cup_price_minor: currentPrice,
        coffee_count: 0,
        currency: "EUR",
        revision,
        transaction_id: `reset-${++sequence}`,
      };
      receipts.set(data.request_id, receipt);
      publish();
      return { response: receipt };
    }
    let delta = 0,
      undoOf;
    const amount = Math.round(Number(data.amount) * 100);
    if (name === "buy_coffee") {
      delta = -currentPrice;
      count++;
    } else if (name === "add_funds") delta = amount;
    else if (name === "set_balance") delta = amount - currentBalance;
    else if (name === "set_price") currentPrice = amount;
    else if (name === "undo") {
      const latest = latestFinancial();
      if (
        latest?.id !== data.transaction_id ||
        !["add_funds", "buy_coffee", "set_balance"].includes(latest.kind)
      )
        throw new Error("This action can no longer be undone.");
      delta = -latest.amount_minor;
      if (latest.kind === "buy_coffee") count--;
      undoOf = latest.id;
    } else throw new Error("Unknown service");
    currentBalance += delta;
    revision++;
    const item = event(name, delta, "You", data.note, undoOf);
    item.timestamp = new Date().toISOString();
    const receipt = {
      balance_minor: currentBalance,
      cup_price_minor: currentPrice,
      coffee_count: count,
      currency: "EUR",
      revision,
      transaction_id: item.id,
    };
    if (data.request_id) receipts.set(data.request_id, receipt);
    publish();
    return { response: receipt };
  }
  function hass() {
    return {
      connected: true,
      language: "en",
      states: { [entity]: state() },
      callService,
    };
  }
  return {
    hass,
    calls,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    async externalCoffee() {
      return callService("coffee_tracker", "buy_coffee", {
        entity_id: entity,
        request_id: `watch-${Date.now()}`,
      });
    },
    history,
    state,
    setFail() {
      fail = true;
    },
  };
}
