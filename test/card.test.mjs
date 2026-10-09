import assert from "node:assert/strict";
import { after, afterEach, test } from "node:test";
import { Window } from "happy-dom";
import { createMockPool, mockConfig, entity } from "../preview/fixtures.mjs";
const browser = new Window({ url: "http://card.test/" });
for (const key of [
  "window",
  "document",
  "HTMLElement",
  "Element",
  "ShadowRoot",
  "Document",
  "CSSStyleSheet",
  "customElements",
  "Event",
  "CustomEvent",
  "MutationObserver",
  "Node",
  "HTMLInputElement",
  "HTMLSelectElement",
])
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: key === "window" ? browser : browser[key],
  });
await import("../custom_components/coffee_tracker/www/coffee-tracker-card.js");
const q = (card, selector) => card.shadowRoot.querySelector(selector);
const content = (card) => card.shadowRoot.textContent;
const mutations = (pool) =>
  pool.calls.filter((call) => call.name !== "get_history");
async function settle(card) {
  await card.updateComplete;
  await new Promise((resolve) => setTimeout(resolve, 8));
  await card.updateComplete;
}
async function fixture(options = {}) {
  const pool = createMockPool({ delay: 0, ...options });
  const card = document.createElement("coffee-tracker-card");
  card.setConfig({ ...mockConfig, ...options.config });
  card.hass = { ...pool.hass(), ...options.hass };
  pool.subscribe((hass) => {
    card.hass = { ...hass, ...options.hass };
  });
  document.body.append(card);
  await settle(card);
  return { card, pool };
}
async function click(card, action) {
  q(card, `[data-action="${action}"]`).click();
  await settle(card);
}
async function input(card, value) {
  const input = q(card, "[data-amount]");
  input.value = value;
  input.dispatchEvent(new Event("input"));
  await settle(card);
}
async function submit(card) {
  q(card, "form").dispatchEvent(
    new Event("submit", { cancelable: true, bubbles: true }),
  );
  await settle(card);
}
afterEach(() => {
  for (const child of [...document.body.children]) child.remove();
});
after(async () => {
  await browser.happyDOM.abort();
  browser.close();
});

test("built card registers with HA and stub chooses only a marked balance sensor", async () => {
  const { card, pool } = await fixture();
  const klass = customElements.get("coffee-tracker-card");
  assert.ok(
    window.customCards.some((item) => item.type === "coffee-tracker-card"),
  );
  assert.equal(klass.getStubConfig(pool.hass()).entity, entity);
  assert.equal(
    klass.getStubConfig({
      states: { "sensor.fake": { state: "2", attributes: {} } },
    }).entity,
    "",
  );
  assert.deepEqual(card.getGridOptions(), {
    columns: 12,
    rows: "auto",
    min_columns: 6,
  });
  assert.throws(
    () => card.setConfig({ entity: "button.coffee" }),
    /balance sensor/,
  );
});
test("available balance, exact cup price, coffees available, and real persisted history render", async () => {
  const { card, pool } = await fixture();
  await click(card, "activity");
  assert.equal(q(card, "[data-balance]").textContent, "€24.50");
  assert.match(content(card), /€1.50 \/ cup/);
  assert.match(content(card), /Enough for\s+16/);
  assert.equal(card.shadowRoot.querySelectorAll(".entry").length, 5);
  assert.equal(mutations(pool).length, 0);
  assert.ok(q(card, '[data-action="more"]'));
});
test("purchase sends guarded request and waits for server acknowledgment before celebration", async () => {
  let resolve;
  const { card, pool } = await fixture();
  const original = card.hass.callService;
  card.hass = {
    ...card.hass,
    callService: (domain, name, data) =>
      name === "buy_coffee"
        ? new Promise((r) => {
            resolve = () => original(domain, name, data).then(r);
          })
        : original,
  };
  q(card, '[data-action="buy"]').click();
  await card.updateComplete;
  assert.equal(q(card, '[data-action="buy"]').disabled, true);
  assert.equal(q(card, ".celebrate"), null);
  assert.equal(q(card, "[data-balance]").textContent, "€24.50");
  resolve();
  await settle(card);
  assert.equal(q(card, "[data-balance]").textContent, "€23.00");
  assert.ok(q(card, ".celebrate"));
  const request = mutations(pool)[0];
  assert.equal(request.name, "buy_coffee");
  assert.equal(request.data.expected_revision, 1);
  assert.ok(request.data.request_id.length >= 8);
  assert.match(content(card), /Coffee recorded/);
});
test("rapid double click produces exactly one coffee", async () => {
  const { card, pool } = await fixture({ delay: 5 });
  const button = q(card, '[data-action="buy"]');
  button.click();
  button.click();
  await settle(card);
  await settle(card);
  assert.equal(mutations(pool).length, 1);
});
test("callWS uses the actual HA service response envelope", async () => {
  const { card, pool } = await fixture();
  const ws = [];
  card.hass = {
    ...pool.hass(),
    callWS: async (message) => {
      ws.push(message);
      return pool
        .hass()
        .callService(message.domain, message.service, message.service_data);
    },
  };
  await click(card, "buy");
  assert.equal(ws[0].type, "call_service");
  assert.equal(ws[0].return_response, true);
  assert.equal(ws[0].service, "buy_coffee");
  assert.ok(q(card, ".celebrate"));
});
test("external Watch purchase updates the shared balance and history without reload", async () => {
  const { card, pool } = await fixture();
  await click(card, "activity");
  await pool.externalCoffee();
  await settle(card);
  assert.equal(q(card, "[data-balance]").textContent, "€23.00");
  assert.match(content(card), /8\s+coffees\s+enjoyed/);
  assert.match(q(card, ".entry").textContent, /You/);
  assert.equal(q(card, ".celebrate"), null);
});
test("adding money handles comma decimal input and never rounds extra precision", async () => {
  const { card, pool } = await fixture();
  await click(card, "add");
  await input(card, "10,25");
  await submit(card);
  assert.equal(mutations(pool)[0].data.amount, "10.25");
  assert.equal(q(card, "[data-balance]").textContent, "€34.75");
  await click(card, "add");
  await input(card, "1.001");
  await submit(card);
  assert.equal(mutations(pool).length, 1);
  assert.match(content(card), /up to two decimal places/);
});
test("zero, negative, exponent, and malformed contributions do not reach HA", async () => {
  const { card, pool } = await fixture();
  await click(card, "add");
  for (const value of ["0", "-1", "1e3", "NaN", "1.2.3"]) {
    await input(card, value);
    await submit(card);
  }
  assert.equal(mutations(pool).length, 0);
});
test("balance correction supports negative cents and preserves reason and revision", async () => {
  const { card, pool } = await fixture();
  await click(card, "balance");
  await input(card, "-0.50");
  const note = q(card, "input[maxlength]");
  note.value = "Count correction";
  note.dispatchEvent(new Event("input"));
  await submit(card);
  const action = mutations(pool)[0];
  assert.equal(action.name, "set_balance");
  assert.equal(action.data.amount, "-0.50");
  assert.equal(action.data.note, "Count correction");
  assert.equal(action.data.expected_revision, 1);
  assert.match(q(card, "[data-balance]").textContent, /-€0.50/);
});
test("another user changing the pool prevents stale absolute balance overwrite", async () => {
  const { card, pool } = await fixture();
  await click(card, "balance");
  await input(card, "50");
  await pool.externalCoffee();
  await settle(card);
  assert.equal(q(card, '[type="submit"]').disabled, true);
  assert.match(content(card), /pool changed while you were editing/);
  assert.equal(mutations(pool).length, 1);
});
test("changing cup price affects future coffee and validates the supported maximum", async () => {
  const { card, pool } = await fixture();
  await click(card, "price");
  await input(card, "10000.01");
  await submit(card);
  assert.equal(mutations(pool).length, 0);
  await input(card, "2.35");
  await submit(card);
  assert.equal(mutations(pool)[0].name, "set_price");
  assert.equal(mutations(pool)[0].data.amount, "2.35");
  await click(card, "buy");
  assert.equal(q(card, "[data-balance]").textContent, "€22.15");
  assert.equal(q(card, ".float-amount").textContent, "−€2.35");
});
test("low and negative balances remain usable and explain overdraft", async () => {
  for (const balance of [75, -75]) {
    const { card, pool } = await fixture({ balance });
    assert.equal(q(card, '[data-action="buy"]').disabled, false);
    assert.match(
      content(card),
      balance < 0 ? /settle the balance/ : /below zero/,
    );
    await click(card, "buy");
    assert.equal(mutations(pool).length, 1);
    card.remove();
  }
});
test("history pagination retains unique actions and shows all available activity", async () => {
  const { card } = await fixture();
  await click(card, "activity");
  await click(card, "more");
  assert.equal(card.shadowRoot.querySelectorAll(".entry").length, 9);
  assert.equal(q(card, '[data-action="more"]'), null);
  assert.match(content(card), /Money added/);
  assert.match(content(card), /Pool opened/);
});
test("Undo is explicit, appends a reversal, and cannot repeatedly undo an undo", async () => {
  const { card, pool } = await fixture();
  await click(card, "activity");
  await click(card, "undo");
  assert.equal(mutations(pool).length, 0);
  assert.match(content(card), /reversal will be added/);
  await click(card, "confirm-undo");
  assert.equal(mutations(pool)[0].name, "undo");
  assert.equal(q(card, "[data-balance]").textContent, "€26.00");
  assert.match(content(card), /Action undone/);
  assert.equal(q(card, '[data-action="undo"]'), null);
});
test("unavailable integration and disconnected transport cannot trigger purchases", async () => {
  const { card, pool } = await fixture({ hass: { connected: false } });
  assert.equal(q(card, '[data-action="buy"]').disabled, true);
  assert.match(content(card), /disconnected/);
  q(card, '[data-action="buy"]').click();
  assert.equal(mutations(pool).length, 0);
  card.hass = {
    ...pool.hass(),
    states: {
      [entity]: { state: "unavailable", attributes: pool.state().attributes },
    },
  };
  await settle(card);
  assert.equal(q(card, '[data-action="buy"]'), null);
  assert.match(content(card), /unavailable/);
});
test("unknown action outcome shows safe retry, no false success, and reuses request ID", async () => {
  const { card, pool } = await fixture({ failOnce: true });
  await click(card, "buy");
  assert.equal(q(card, ".celebrate"), null);
  assert.match(content(card), /not confirmed/);
  assert.equal(q(card, '[data-action="buy"]').disabled, true);
  const id = mutations(pool)[0].data.request_id;
  await click(card, "retry");
  assert.equal(mutations(pool)[1].data.request_id, id);
  assert.equal(q(card, "[data-balance]").textContent, "€23.00");
  assert.ok(q(card, ".celebrate"));
});
test("lost acknowledgment after committed purchase retries without charging twice", async () => {
  const { card, pool } = await fixture();
  const original = pool.hass().callService;
  let lost = true;
  const wrapped = async (domain, name, data) => {
    const result = await original(domain, name, data);
    if (name === "buy_coffee" && lost) {
      lost = false;
      throw new Error("Connection lost");
    }
    return result;
  };
  card.hass = { ...pool.hass(), callService: wrapped };
  await click(card, "buy");
  assert.equal(q(card, "[data-balance]").textContent, "€23.00");
  assert.ok(q(card, '[data-action="retry"]'));
  await click(card, "retry");
  assert.equal(q(card, "[data-balance]").textContent, "€23.00");
  assert.equal(
    pool.history().filter((item) => item.kind === "buy_coffee").length,
    8,
  );
});
test("declared validation rejection keeps editing available and does not offer doomed retry", async () => {
  const { card, pool } = await fixture();
  card.hass = {
    ...pool.hass(),
    callService: async (domain, name, data) => {
      if (name === "buy_coffee")
        throw {
          code: "service_validation_error",
          message:
            "stale_revision: The pool changed. Review the latest balance.",
        };
      return pool.hass().callService(domain, name, data);
    },
  };
  await click(card, "buy");
  assert.equal(q(card, '[data-action="retry"]'), null);
  assert.equal(q(card, '[data-action="buy"]').disabled, false);
  assert.match(content(card), /action was declined/);
  assert.equal(q(card, ".celebrate"), null);
});
test("permission rejection does not claim an uncertain payment", async () => {
  const { card, pool } = await fixture();
  card.hass = {
    ...pool.hass(),
    callService: async (domain, name, data) => {
      if (name === "buy_coffee")
        throw {
          code: "unauthorized",
          message: "You do not have permission to control this pool.",
        };
      return pool.hass().callService(domain, name, data);
    },
  };
  await click(card, "buy");
  assert.match(content(card), /permission/);
  assert.equal(q(card, '[data-action="retry"]'), null);
});
test("history failure has its own retry and never disables the coffee button", async () => {
  const { card, pool } = await fixture();
  await click(card, "activity");
  card.hass = {
    ...pool.hass(),
    callService: async () => {
      throw new Error("History offline");
    },
  };
  await card.loadHistory();
  await settle(card);
  assert.match(content(card), /History could not be loaded/);
  assert.equal(q(card, '[data-action="buy"]').disabled, false);
});
test("new pool guides first contribution and does not fabricate transactions", async () => {
  const { card, pool } = await fixture({ empty: true });
  await click(card, "activity");
  assert.match(content(card), /coffee story starts here/);
  assert.equal(card.shadowRoot.querySelectorAll(".entry").length, 0);
  assert.equal(mutations(pool).length, 0);
});
test("editor lists only real coffee pools and emits config changes", async () => {
  const { pool } = await fixture();
  const editor = customElements.get("coffee-tracker-card").getConfigElement();
  editor.setConfig(mockConfig);
  editor.hass = {
    ...pool.hass(),
    states: {
      ...pool.hass().states,
      "sensor.other": {
        state: "50",
        attributes: { friendly_name: "Not a pool" },
      },
    },
  };
  document.body.append(editor);
  await settle(editor);
  assert.deepEqual(
    [...q(editor, "select").options].map((item) => item.value),
    ["", entity],
  );
  let event;
  editor.addEventListener("config-changed", (e) => {
    event = e;
  });
  const title = q(editor, "[data-title]");
  title.value = "Office coffee";
  title.dispatchEvent(new Event("input"));
  assert.equal(event.detail.config.title, "Office coffee");
  assert.equal(event.detail.config.entity, entity);
});
test("templates escape contributed notes and user names", async () => {
  const { card, pool } = await fixture();
  await click(card, "activity");
  await click(card, "balance");
  await input(card, "22");
  const note = q(card, "input[maxlength]");
  note.value = "<img src=x onerror=alert(1)>";
  note.dispatchEvent(new Event("input"));
  await submit(card);
  assert.equal(q(card, "img"), null);
  assert.match(content(card), /<img src=x/);
});
test("built styles include narrow layouts, keyboard focus, and reduced motion", async () => {
  const klass = customElements.get("coffee-tracker-card");
  const css = klass.styles
    .flat(Infinity)
    .map((style) => style.cssText)
    .join("");
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /focus-visible/);
  assert.match(css, /max-width:\s*340px/);
  assert.match(css, /isolation:\s*isolate/);
});

test("callService fallback asks for service response in the sixth argument", async () => {
  const { card, pool } = await fixture();
  const calls = [];
  card.hass = {
    ...pool.hass(),
    callService: async (...args) => {
      calls.push(args);
      return pool.hass().callService(...args);
    },
  };
  await click(card, "buy");
  const purchase = calls.find((args) => args[1] === "buy_coffee");
  assert.equal(purchase.length, 6);
  assert.equal(purchase[3], undefined);
  assert.equal(purchase[4], false);
  assert.equal(purchase[5], true);
  assert.ok(q(card, ".celebrate"));
});

test("Activity starts collapsed and removes hidden controls from the tab order", async () => {
  const { card, pool } = await fixture();
  const toggle = q(card, '[data-action="activity"]');
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(toggle.getAttribute("aria-controls"), "coffee-activity");
  assert.equal(q(card, "#coffee-activity").hidden, true);
  assert.equal(q(card, ".entry"), null);
  assert.equal(q(card, '[data-action="undo"]'), null);
  assert.equal(q(card, '[data-action="more"]'), null);
  assert.equal(card.getCardSize(), 4);
  await click(card, "activity");
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(card.shadowRoot.querySelectorAll(".entry").length, 5);
  assert.equal(card.getCardSize(), 7);
  await click(card, "undo");
  await click(card, "activity");
  assert.equal(q(card, '[data-action="confirm-undo"]'), null);
  assert.equal(q(card, "#coffee-activity").children.length, 0);
  await pool.externalCoffee();
  await settle(card);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.match(toggle.textContent.replace(/\s+/g, " "), /8 coffees enjoyed/);
  await click(card, "activity");
  assert.equal(q(card, '[data-action="confirm-undo"]'), null);
});

test("header uses a bounded mdi:cog icon and omits the shared-pool subtitle", async () => {
  const { card } = await fixture();
  assert.equal(
    q(card, '[data-action="settings"] ha-icon').getAttribute("icon"),
    "mdi:cog",
  );
  assert.equal(q(card, ".subtitle"), null);
  assert.doesNotMatch(content(card), /a shared coffee pool/i);
  const css = customElements
    .get("coffee-tracker-card")
    .styles.flat(Infinity)
    .map((s) => s.cssText)
    .join("");
  assert.match(css, /ha-icon\s*\{[^}]*width:\s*21px/);
  assert.match(css, /ha-icon\s*\{[^}]*height:\s*21px/);
  assert.match(css, /--mdc-icon-size:\s*21px/);
});

async function openReset(card) {
  await click(card, "settings");
  await click(card, "reset");
}

test("reset is only available in Settings and opens a descriptive modal without mutation", async () => {
  const { card, pool } = await fixture();
  assert.equal(q(card, '[data-action="reset"]'), null);
  await openReset(card);
  const dialog = q(card, "dialog");
  assert.equal(dialog.open, true);
  assert.equal(dialog.getAttribute("aria-modal"), "true");
  assert.equal(dialog.getAttribute("aria-labelledby"), "reset-title");
  assert.equal(dialog.getAttribute("aria-describedby"), "reset-description");
  assert.match(dialog.textContent, /Delete all activity/);
  assert.match(dialog.textContent, /coffee count to zero/);
  assert.match(dialog.textContent, /affects everyone/);
  assert.match(dialog.textContent, /cannot be undone/);
  assert.match(
    dialog.textContent,
    /Cup price[\s\S]*€1.50[\s\S]*currency.*EUR[\s\S]*stay the same/,
  );
  assert.equal(
    card.shadowRoot.activeElement,
    q(card, '[data-action="cancel-reset"]'),
  );
  assert.equal(mutations(pool).length, 0);
});

test("Cancel and Escape close the reset modal without changing the ledger", async () => {
  const { card, pool } = await fixture();
  await openReset(card);
  await click(card, "cancel-reset");
  assert.equal(q(card, "dialog"), null);
  assert.equal(card.shadowRoot.activeElement, q(card, '[data-action="reset"]'));
  await click(card, "reset");
  const escape = new Event("cancel", { cancelable: true });
  q(card, "dialog").dispatchEvent(escape);
  await settle(card);
  assert.equal(escape.defaultPrevented, true);
  assert.equal(q(card, "dialog"), null);
  assert.equal(pool.history().length, 9);
  assert.equal(mutations(pool).length, 0);
});

test("confirmed reset clears activity, balance, and count, preserves cup price, and keeps the pool usable", async () => {
  const { card, pool } = await fixture({ price: 235 });
  await openReset(card);
  await click(card, "confirm-reset");
  const request = mutations(pool)[0];
  assert.equal(request.name, "reset_ledger");
  assert.equal(request.data.entity_id, entity);
  assert.equal(request.data.confirmed, true);
  assert.equal(request.data.expected_revision, 1);
  assert.ok(request.data.request_id.length >= 8);
  assert.equal(pool.state().attributes.revision, 2);
  assert.equal(pool.state().attributes.coffee_count, 0);
  assert.equal(pool.state().attributes.cup_price_minor, 235);
  assert.equal(pool.state().attributes.currency, "EUR");
  assert.equal(pool.history().length, 0);
  assert.equal(q(card, "dialog"), null);
  assert.equal(q(card, "[data-balance]").textContent, "€0.00");
  assert.match(content(card), /Ledger reset/);
  assert.equal(
    q(card, '[data-action="activity"]').getAttribute("aria-expanded"),
    "false",
  );
  await click(card, "activity");
  assert.match(content(card), /coffee story starts here/);
  assert.equal(q(card, '[data-action="undo"]'), null);
  await click(card, "add");
  await input(card, "10");
  await submit(card);
  assert.equal(q(card, "[data-balance]").textContent, "€10.00");
  await click(card, "buy");
  assert.equal(q(card, "[data-balance]").textContent, "€7.65");
});

test("new card instance sees the cleared shared pool without reviving old activity", async () => {
  const { card, pool } = await fixture();
  await openReset(card);
  await click(card, "confirm-reset");
  card.remove();
  const reloaded = document.createElement("coffee-tracker-card");
  reloaded.setConfig(mockConfig);
  reloaded.hass = pool.hass();
  document.body.append(reloaded);
  await settle(reloaded);
  assert.equal(q(reloaded, "[data-balance]").textContent, "€0.00");
  assert.equal(
    q(reloaded, '[data-action="activity"]').getAttribute("aria-expanded"),
    "false",
  );
  await click(reloaded, "activity");
  assert.equal(q(reloaded, ".entry"), null);
  assert.equal(q(reloaded, '[data-action="undo"]'), null);
});

test("incoming Watch action requires review and a separate fresh confirmation", async () => {
  const { card, pool } = await fixture();
  await openReset(card);
  await pool.externalCoffee();
  await settle(card);
  assert.equal(q(card, '[data-action="confirm-reset"]').disabled, true);
  assert.match(q(card, "dialog").textContent, /pool changed/);
  assert.match(q(card, ".reset-summary").textContent, /€24.50/);
  await click(card, "confirm-reset");
  assert.equal(
    mutations(pool).filter((c) => c.name === "reset_ledger").length,
    0,
  );
  await click(card, "review-reset");
  assert.equal(q(card, '[data-action="confirm-reset"]').disabled, false);
  assert.match(q(card, ".reset-summary").textContent, /€23.00/);
  assert.equal(
    mutations(pool).filter((c) => c.name === "reset_ledger").length,
    0,
  );
  await click(card, "confirm-reset");
  assert.equal(mutations(pool).at(-1).data.expected_revision, 2);
});

test("pending reset prevents duplicate confirmation and Escape dismissal", async () => {
  const { card, pool } = await fixture();
  await openReset(card);
  const original = pool.hass().callService;
  let resolve;
  card.hass = {
    ...pool.hass(),
    callService: (domain, name, data) =>
      name === "reset_ledger"
        ? new Promise((r) => {
            resolve = () => original(domain, name, data).then(r);
          })
        : original(domain, name, data),
  };
  const button = q(card, '[data-action="confirm-reset"]');
  button.click();
  button.click();
  await card.updateComplete;
  assert.equal(button.disabled, true);
  assert.equal(q(card, '[data-action="cancel-reset"]').disabled, true);
  q(card, "dialog").dispatchEvent(new Event("cancel", { cancelable: true }));
  await card.updateComplete;
  assert.equal(q(card, "dialog").open, true);
  assert.equal(q(card, "[data-balance]").textContent, "€24.50");
  resolve();
  await settle(card);
  assert.equal(
    mutations(pool).filter((c) => c.name === "reset_ledger").length,
    1,
  );
  assert.equal(q(card, "dialog"), null);
});

test("unconfirmed reset can only retry inside the modal with the original request", async () => {
  const { card, pool } = await fixture({ failOnce: true });
  await openReset(card);
  await click(card, "confirm-reset");
  assert.equal(q(card, "dialog").open, true);
  assert.match(q(card, "dialog").textContent, /not confirmed/);
  assert.equal(pool.history().length, 9);
  const request = mutations(pool)[0].data;
  await click(card, "cancel-reset");
  assert.equal(q(card, "dialog"), null);
  assert.equal(q(card, '[data-action="buy"]').disabled, true);
  assert.match(q(card, '[data-action="retry"]').textContent, /Review reset/);
  await click(card, "retry");
  assert.equal(mutations(pool).length, 1);
  assert.equal(q(card, "dialog").open, true);
  await click(card, "confirm-reset");
  assert.deepEqual(mutations(pool)[1].data, request);
  assert.equal(pool.history().length, 0);
});

test("retry of an already completed reset preserves later Watch activity", async () => {
  const { card, pool } = await fixture();
  await openReset(card);
  const original = pool.hass().callService;
  card.hass = {
    ...pool.hass(),
    callService: async (domain, name, data) => {
      const result = await original(domain, name, data);
      if (name === "reset_ledger") throw new Error("Acknowledgment lost");
      return result;
    },
  };
  await click(card, "confirm-reset");
  assert.equal(pool.history().length, 0);
  assert.equal(q(card, "dialog").open, true);
  await pool.externalCoffee();
  await settle(card);
  assert.equal(pool.history().length, 1);
  const id = mutations(pool)[0].data.request_id;
  await click(card, "confirm-reset");
  assert.equal(mutations(pool).at(-1).data.request_id, id);
  assert.equal(pool.history().length, 1);
  assert.equal(q(card, "[data-balance]").textContent, "-€1.50");
  assert.equal(pool.state().attributes.coffee_count, 1);
  assert.doesNotMatch(content(card), /are now zero/);
});

test("server-declared reset rejection keeps its modal open without a transport retry", async () => {
  const { card, pool } = await fixture();
  await openReset(card);
  card.hass = {
    ...pool.hass(),
    callService: async (domain, name, data) => {
      if (name === "reset_ledger")
        throw {
          code: "unauthorized",
          message: "You cannot control this pool.",
        };
      return pool.hass().callService(domain, name, data);
    },
  };
  await click(card, "confirm-reset");
  assert.equal(q(card, "dialog").open, true);
  assert.match(q(card, "dialog").textContent, /cannot control/);
  assert.doesNotMatch(q(card, "dialog").textContent, /not confirmed/);
  assert.equal(pool.history().length, 9);
  await click(card, "cancel-reset");
  assert.equal(q(card, '[data-action="retry"]'), null);
  assert.equal(q(card, '[data-action="buy"]').disabled, false);
});

test("old integration versions explain the required update without sending a missing reset service", async () => {
  const { card, pool } = await fixture();
  const old = pool.state();
  delete old.attributes.supports_reset;
  card.hass = { ...pool.hass(), states: { [entity]: old } };
  await settle(card);
  await click(card, "settings");
  assert.equal(q(card, '[data-action="reset"]').disabled, true);
  assert.match(content(card), /Restart Home Assistant after updating/);
  await click(card, "reset");
  assert.equal(q(card, "dialog"), null);
  assert.equal(mutations(pool).length, 0);
  assert.equal(q(card, '[data-action="buy"]').disabled, false);
});

test("reset cannot be confirmed after transport disconnects", async () => {
  const { card, pool } = await fixture();
  await openReset(card);
  card.hass = { ...pool.hass(), connected: false };
  await settle(card);
  assert.equal(q(card, '[data-action="confirm-reset"]').disabled, true);
  await click(card, "confirm-reset");
  assert.equal(mutations(pool).length, 0);
  await click(card, "cancel-reset");
  assert.equal(q(card, "dialog"), null);
});

test("preview reset retires old request IDs rather than resurrecting deleted financial actions", async () => {
  const pool = createMockPool({ delay: 0 });
  const service = pool.hass().callService;
  const oldRequest = {
    entity_id: entity,
    amount: "10.00",
    request_id: "old-contribution",
  };
  await service("coffee_tracker", "add_funds", oldRequest);
  await service("coffee_tracker", "reset_ledger", {
    entity_id: entity,
    confirmed: true,
    expected_revision: 2,
    request_id: "reset-request",
  });
  await assert.rejects(
    service("coffee_tracker", "add_funds", oldRequest),
    (error) => error.code === "service_validation_error",
  );
  assert.equal(pool.history().length, 0);
  assert.equal(pool.state().attributes.balance_minor, 0);
});
