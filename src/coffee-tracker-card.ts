import { LitElement, html, nothing, type PropertyValues } from "lit";
import { designTokens } from "./shared/design-tokens";
import {
  familyStyles,
  headerStyles,
  dialogStyles,
  FamilyFlowController,
  renderFamilyDialog,
  componentStyles,
  actionPill,
  notice,
} from "./shared/card-primitives";
import { buildGlow, glowStyles } from "./shared/glow";
import { styles } from "./styles";
import { icon, cupArt } from "./icons";
import {
  actionLabels,
  decimal,
  isPool,
  isRejectedAction,
  money,
  parseAmount,
  poolFrom,
  requestId,
  service,
} from "./model";
import type {
  CardConfig,
  EditMode,
  HistoryItem,
  HistoryResponse,
  HomeAssistant,
  Receipt,
  Pool,
} from "./types";
import "./editor";
interface FailedRequest {
  name: string;
  data: Record<string, unknown>;
  label: string;
  price: number;
  entity: string;
}
export class CoffeeTrackerCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    config: { state: true },
    history: { state: true },
    historyLoading: { state: true },
    historyError: { state: true },
    hasMore: { state: true },
    pending: { state: true },
    pendingAction: { state: true },
    mode: { state: true },
    settings: { state: true },
    amount: { state: true },
    note: { state: true },
    formError: { state: true },
    feedback: { state: true },
    error: { state: true },
    celebrating: { state: true },
    spent: { state: true },
    failed: { state: true },
    undoConfirm: { state: true },
    activityExpanded: { state: true },
    resetOpen: { state: true },
    resetSnapshot: { state: true },
  };
  static styles = [
    designTokens,
    styles,
    familyStyles,
    headerStyles,
    dialogStyles,
    componentStyles,
    glowStyles,
  ];
  hass?: HomeAssistant;
  private config?: CardConfig;
  private history: HistoryItem[] = [];
  private historyLoading = false;
  private historyError = "";
  private hasMore = false;
  private nextBefore: number | null = null;
  private pending = false;
  private pendingAction = "";
  private mode: EditMode = null;
  private settings = false;
  private amount = "";
  private note = "";
  private formError = "";
  private feedback = "";
  private error = "";
  private celebrating = false;
  private spent = 0;
  private failed: FailedRequest | null = null;
  private undoConfirm = false;
  private activityExpanded = false;
  private resetOpen = false;
  private resetSnapshot: Pool | null = null;
  private formRevision = 0;
  private formBaseline = { amount: "", note: "" };
  private operationEpoch = 0;
  private undoSnapshot?: {
    transaction_id: string;
    expected_revision: number;
    label: string;
  };
  private flow = new FamilyFlowController<
    "settings" | "add" | "balance" | "price" | "reset" | "undo"
  >(this, {
    guard: (intent) => ({
      pending: intent === "navigate" && this.pending,
      dirty:
        !!this.mode &&
        !this.pending &&
        !this.failed &&
        (this.amount !== this.formBaseline.amount ||
          this.note !== this.formBaseline.note),
      discard: () => {
        this.amount = this.formBaseline.amount;
        this.note = this.formBaseline.note;
      },
    }),
    onChange: (route) => {
      this.mode =
        route === "add" || route === "balance" || route === "price"
          ? route
          : null;
      this.settings = route === "settings";
      this.resetOpen = route === "reset";
      this.undoConfirm = route === "undo";
      this.formError = "";
      if (this.mode) {
        this.amount =
          this.mode === "balance"
            ? decimal(this.pool?.balance || 0)
            : this.mode === "price"
              ? decimal(this.pool?.price || 0)
              : "";
        this.note = "";
        this.formRevision = this.pool?.revision || 0;
        this.formBaseline = { amount: this.amount, note: this.note };
      }
    },
  });
  private historyGeneration = 0;
  private observed = "";
  private animationTimer?: ReturnType<typeof setTimeout>;
  setConfig(config: CardConfig) {
    if (
      !config ||
      typeof config.entity !== "string" ||
      !config.entity.startsWith("sensor.")
    )
      throw new Error("Select the Coffee Tracker balance sensor.");
    if (config.title !== undefined && typeof config.title !== "string")
      throw new Error("Title must be text.");
    if (this.config?.entity !== config.entity) {
      this.flow.forceClose(false);
      this.operationEpoch++;
      this.pending = false;
      this.pendingAction = "";
      this.resetOpen = false;
      this.resetSnapshot = null;
      this.activityExpanded = false;
      this.historyGeneration++;
      this.history = [];
      this.hasMore = false;
      this.historyError = "";
      this.historyLoading = false;
      this.mode = null;
      this.settings = false;
      this.failed = null;
      this.error = "";
      this.feedback = "";
      this.observed = "";
    }
    this.config = { ...config };
  }
  static getConfigElement() {
    return document.createElement("coffee-tracker-card-editor");
  }
  static getStubConfig(hass?: HomeAssistant) {
    return {
      type: "custom:coffee-tracker-card",
      entity:
        Object.keys(hass?.states || {}).find(
          (id) => id.startsWith("sensor.") && isPool(hass!.states[id]),
        ) || "",
    };
  }
  getCardSize() {
    return this.activityExpanded ? 7 : 4;
  }
  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }
  private get pool() {
    return poolFrom(this.hass?.states[this.config?.entity || ""]);
  }
  private get online() {
    return this.hass?.connected !== false && !!this.pool;
  }
  private get supportsReset() {
    return (
      this.hass?.states[this.config?.entity || ""]?.attributes
        .supports_reset === true
    );
  }
  private get locale() {
    return this.hass?.locale?.language || this.hass?.language || "en";
  }
  private currency(minor: number) {
    return money(minor, this.pool?.currency || "EUR", this.locale);
  }
  protected updated(_changed: PropertyValues) {
    const key = `${this.config?.entity}:${this.pool?.revision}:${this.online}`;
    if (key !== this.observed) {
      this.observed = key;
      if (this.online) void this.loadHistory();
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.observed = "";
    this.requestUpdate();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.resetOpen = false;
    this.mode = null;
    this.settings = false;
    this.undoConfirm = false;
    this.historyGeneration++;
    clearTimeout(this.animationTimer);
    this.celebrating = false;
  }
  private async loadHistory(append = false) {
    const hass = this.hass,
      entity = this.config?.entity;
    if (!hass || !entity || !this.online) return;
    const generation = ++this.historyGeneration;
    this.historyLoading = true;
    this.historyError = "";
    try {
      const data: Record<string, unknown> = { entity_id: entity, limit: 5 };
      if (append && this.nextBefore !== null) data.before = this.nextBefore;
      const result = await service<HistoryResponse>(hass, "get_history", data);
      if (
        generation !== this.historyGeneration ||
        entity !== this.config?.entity
      )
        return;
      if (!result || !Array.isArray(result.items))
        throw new Error("History response was not available.");
      if (append && result.revision !== this.pool?.revision) {
        void this.loadHistory();
        return;
      }
      this.history = append
        ? [
            ...this.history,
            ...result.items.filter(
              (item) => !this.history.some((old) => old.id === item.id),
            ),
          ]
        : result.items;
      this.hasMore = result.has_more;
      this.nextBefore = result.next_before;
    } catch (err) {
      if (generation === this.historyGeneration)
        this.historyError = this.errorText(err);
    } finally {
      if (generation === this.historyGeneration) this.historyLoading = false;
    }
  }
  private errorText(err: unknown) {
    if (err && typeof err === "object" && "message" in err)
      return String(err.message);
    return String(err || "Could not reach Home Assistant.");
  }
  private open(mode: EditMode, opener?: HTMLElement) {
    if (this.pending || !mode) return;
    if (this.flow.current === "settings") this.flow.push(mode);
    else this.flow.open(mode, opener);
  }
  private close() {
    this.flow.close();
  }
  private openReset() {
    if (
      this.pending ||
      !this.online ||
      !this.supportsReset ||
      (this.failed && this.failed.name !== "reset_ledger")
    )
      return;
    if (this.failed?.name !== "reset_ledger") {
      this.resetSnapshot = { ...this.pool! };
      this.error = "";
    }
    if (this.flow.current === "settings") this.flow.push("reset");
    else
      this.flow.open(
        "reset",
        this.renderRoot.querySelector<HTMLElement>('[data-action="retry"]') ??
          undefined,
      );
  }
  private closeReset() {
    this.flow.back();
  }
  private confirmReset() {
    if (!this.resetOpen || !this.resetSnapshot || !this.supportsReset) return;
    if (this.failed?.name === "reset_ledger") {
      void this.mutate(
        this.failed.name,
        this.failed.data,
        this.failed.label,
        this.failed,
      );
    } else if (this.pool?.revision === this.resetSnapshot.revision) {
      void this.mutate(
        "reset_ledger",
        {
          confirmed: true,
          expected_revision: this.resetSnapshot.revision,
        },
        "Ledger reset. Previous activity was deleted.",
      );
    }
  }
  private resetContent(title: string) {
    if (!this.resetSnapshot) return nothing;
    const uncertain = this.failed?.name === "reset_ledger";
    const stale =
      !uncertain && this.pool?.revision !== this.resetSnapshot.revision;
    return html`
      <p id="reset-description">
        Delete all activity in <strong>${title}</strong> and reset its balance
        and coffee count to zero. This affects everyone using this pool and
        cannot be undone.
      </p>
      <div class="reset-summary">
        <span
          >Current balance<strong
            >${money(this.resetSnapshot.balance, this.resetSnapshot.currency, this.locale)}</strong
          ></span
        >
        <span
          >Coffees recorded<strong>${this.resetSnapshot.count}</strong></span
        >
      </div>
      <p class="hint">
        Cup price
        (${money(this.resetSnapshot.price, this.resetSnapshot.currency, this.locale)})
        and currency (${this.resetSnapshot.currency}) stay the same.
      </p>
      ${
        this.error
          ? html`<div class="notice error" role="alert">
              ${this.error}
              ${uncertain ? html`<p class="hint">The reset was not confirmed. Retry the same request safely, or close and check the balance and activity. A retry will not delete any activity recorded after a completed reset.</p>` : nothing}
            </div>`
          : nothing
      }
      ${
        stale
          ? html`<p class="form-error" role="status">
                The pool changed since you opened this confirmation. Review the
                latest balance before resetting.
              </p>
              <button
                class="text-button"
                data-action="review-reset"
                ?disabled=${this.pending || !this.online}
                @click=${() => {
                  this.resetSnapshot = { ...this.pool! };
                  this.error = "";
                }}
              >
                Review latest balance
              </button>`
          : nothing
      }
      ${this.pending ? html`<p class="hint" role="status">Resetting ledger. Closing this view will not cancel the request.</p>` : nothing}
    `;
  }
  private resetFooter() {
    const uncertain = this.failed?.name === "reset_ledger";
    const stale =
      !uncertain && this.pool?.revision !== this.resetSnapshot?.revision;
    return html`
      ${
        !uncertain
          ? html`<button
              class="reset-cancel family-action"
              data-family-initial-focus
              data-action="cancel-reset"
              ?disabled=${this.pending}
              @click=${this.closeReset}
            >
              Cancel
            </button>`
          : nothing
      }
      <button
        class="reset-confirm family-action destructive"
        data-action="confirm-reset"
        ?disabled=${this.pending || !this.online || !this.supportsReset || stale}
        @click=${this.confirmReset}
      >
        ${this.pending ? "Resetting…" : uncertain ? "Retry reset" : "Reset ledger"}
      </button>
    `;
  }
  private async mutate(
    name: string,
    data: Record<string, unknown>,
    label: string,
    retry?: FailedRequest,
  ) {
    if (
      this.pending ||
      !this.online ||
      !this.hass ||
      !this.config ||
      (!retry && this.failed)
    )
      return;
    const request = retry || {
      name,
      data: { entity_id: this.config.entity, request_id: requestId(), ...data },
      label,
      price: this.pool!.price,
      entity: this.config.entity,
    };
    const operationEpoch = this.operationEpoch;
    const flowGeneration = this.flow.generation;
    this.pending = true;
    this.pendingAction = request.name;
    this.error = "";
    this.feedback = "";
    try {
      const receipt = await service<Receipt>(
        this.hass,
        request.name,
        request.data,
      );
      if (
        operationEpoch !== this.operationEpoch ||
        this.config.entity !== request.entity
      )
        return;
      if (
        !receipt ||
        !Number.isSafeInteger(receipt.revision) ||
        !receipt.transaction_id
      )
        throw new Error("Home Assistant did not confirm this action.");
      this.failed = null;
      if (this.flow.isCurrent(flowGeneration)) this.flow.forceClose();
      this.feedback = request.label;
      if (request.name === "reset_ledger") {
        if (!this.resetOpen) this.resetSnapshot = null;
        this.history = [];
        this.hasMore = false;
        this.nextBefore = null;
        this.activityExpanded = false;
        clearTimeout(this.animationTimer);
        this.celebrating = false;
      }
      if (request.name === "buy_coffee") {
        this.spent = receipt.cup_price_minor;
        this.celebrating = false;
        await this.updateComplete;
        if (operationEpoch !== this.operationEpoch || !this.isConnected) return;
        this.celebrating = true;
        clearTimeout(this.animationTimer);
        this.animationTimer = setTimeout(() => {
          this.celebrating = false;
        }, 1900);
      }
      void this.loadHistory();
    } catch (err) {
      if (
        operationEpoch === this.operationEpoch &&
        this.config.entity === request.entity
      ) {
        this.failed = isRejectedAction(err) ? null : request;
        this.error = this.errorText(err);
        void this.loadHistory();
      }
    } finally {
      if (operationEpoch === this.operationEpoch) {
        this.pending = false;
        this.pendingAction = "";
      }
    }
  }
  private buy() {
    if (this.pool)
      void this.mutate(
        "buy_coffee",
        { expected_revision: this.pool.revision },
        "Coffee recorded. Enjoy your break.",
      );
  }
  private submit(event: Event) {
    event.preventDefault();
    if (!this.pool || !this.mode) return;
    const amount = parseAmount(this.amount, this.mode !== "balance");
    if (amount === null) {
      this.formError =
        this.mode === "balance"
          ? "Enter an amount with up to two decimal places."
          : "Enter an amount greater than zero, with up to two decimal places.";
      return;
    }
    if (this.mode === "price" && Number(amount) > 10000) {
      this.formError = "Cup price must be 10,000 or less.";
      return;
    }
    if (this.mode === "add") {
      void this.mutate(
        "add_funds",
        { amount },
        `${this.currency(Math.round(Number(amount) * 100))} added to the pool.`,
      );
    } else if (this.mode === "balance") {
      void this.mutate(
        "set_balance",
        {
          amount,
          expected_revision: this.formRevision,
          ...(this.note.trim() ? { note: this.note.trim() } : {}),
        },
        "Balance updated.",
      );
    } else {
      void this.mutate(
        "set_price",
        { amount, expected_revision: this.formRevision },
        "Cup price updated for future coffees.",
      );
    }
  }
  private date(timestamp: string) {
    const date = new Date(timestamp);
    if (!Number.isFinite(date.getTime())) return timestamp;
    return new Intl.DateTimeFormat(this.locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  private entry(item: HistoryItem) {
    const credit = item.amount_minor > 0;
    return html`<div class="entry">
      <div class="entry-icon ${credit ? "credit" : ""}">
        ${icon(item.kind === "buy_coffee" ? "coffee" : item.kind === "set_price" ? "settings" : item.kind === "undo" ? "undo" : credit ? "plus" : "adjust")}
      </div>
      <div class="entry-copy">
        <div class="entry-title">
          ${actionLabels[item.kind] || "Pool updated"}
        </div>
        <div class="entry-meta">
          <time datetime=${item.timestamp}>${this.date(item.timestamp)}</time> ·
          ${item.actor || "Automation"}
        </div>
        ${item.note ? html`<div class="entry-note">${item.note}</div>` : nothing}
      </div>
      <div class="entry-value ${credit ? "credit" : ""}">
        ${item.kind === "set_price" ? this.currency(item.cup_price_minor) : `${credit ? "+" : ""}${this.currency(item.amount_minor)}`}
        <div class="entry-balance">
          ${item.kind === "set_price" ? "per cup" : `${this.currency(item.balance_minor)} left`}
        </div>
      </div>
    </div>`;
  }
  private editPanel() {
    if (!this.mode) return nothing;
    const title =
      this.mode === "add"
        ? "Add to the pool"
        : this.mode === "balance"
          ? "Adjust balance"
          : "Price per cup";
    const stale =
      this.mode !== "add" && this.pool?.revision !== this.formRevision;
    return html`<section class="edit-content" aria-label=${title}>
      <p class="hint">
        ${this.mode === "add" ? "Record a contribution to the shared coffee pool." : this.mode === "balance" ? "Set the correct total. The adjustment stays in the history." : "Applies to everyone. Previous coffees keep their original price."}
      </p>
      <form @submit=${this.submit}>
        <label class="field"
          >${this.mode === "balance" ? "New balance" : "Amount"}
          (${this.pool?.currency})<input
            data-amount
            data-family-initial-focus
            inputmode="decimal"
            autocomplete="off"
            .value=${this.amount}
            ?disabled=${this.pending || !!this.failed}
            @input=${(event: Event) => {
              this.amount = (event.target as HTMLInputElement).value;
              this.formError = "";
            }}
            placeholder="0.00"
            required
            aria-describedby="amount-hint"
          /><small id="amount-hint"
            >${this.mode === "balance" ? "A negative balance represents money owed." : "Use up to two decimal places."}</small
          ></label
        >${
          this.mode === "add"
            ? html`<div class="presets">
                ${[5, 10, 20].map((amount) =>
                  actionPill({
                    label: this.currency(amount * 100),
                    disabled: this.pending || !!this.failed,
                    onClick: () => {
                      this.amount = amount.toFixed(2);
                    },
                  }),
                )}
              </div>`
            : nothing
        }${
          this.mode === "balance"
            ? html`<label class="field"
                >Reason (optional)<input
                  maxlength="200"
                  .value=${this.note}
                  ?disabled=${this.pending}
                  @input=${(event: Event) => {
                    this.note = (event.target as HTMLInputElement).value;
                  }}
                  placeholder="e.g. Correcting a contribution"
              /></label>`
            : nothing
        }${
          stale
            ? html`<p class="form-error" role="status">
                  The pool changed while you were editing. Review the current
                  balance before saving.
                </p>
                <button
                  type="button"
                  class="text-button"
                  @click=${() => {
                    this.formRevision = this.pool!.revision;
                    this.amount = decimal(
                      this.mode === "balance"
                        ? this.pool!.balance
                        : this.pool!.price,
                    );
                    this.formBaseline = {
                      amount: this.amount,
                      note: this.note,
                    };
                  }}
                >
                  Use latest value
                </button>`
            : nothing
        }${this.formError ? html`<p class="form-error" role="alert">${this.formError}</p>` : nothing}<button
          type="submit"
          class="purchase form-submit"
          ?disabled=${this.pending || !!this.failed || stale || !this.online}
        >
          ${this.pending ? "Saving…" : this.mode === "add" ? "Add money" : this.mode === "balance" ? "Save balance" : "Save cup price"}
        </button>
      </form>
    </section>`;
  }
  private settingsContent() {
    if (!this.pool) return nothing;
    return html`<div class="settings-options">
        <button
          class="settings-option"
          ?disabled=${this.pending || !!this.failed || !this.online}
          @click=${() => this.open("price")}
        >
          <span
            >Price per cup<small
              >${this.currency(this.pool!.price)} · shared by everyone</small
            ></span
          >${icon("arrow")}</button
        ><button
          class="settings-option"
          ?disabled=${this.pending || !!this.failed || !this.online}
          @click=${() => this.open("balance")}
        >
          <span
            >Adjust balance<small
              >Correct the total with an audit trail</small
            ></span
          >${icon("arrow")}
        </button>
        <button
          class="settings-option danger-option"
          data-action="reset"
          ?disabled=${this.pending || !!this.failed || !this.online || !this.supportsReset}
          @click=${this.openReset}
        >
          <span
            >Reset ledger<small
              >${this.supportsReset ? "Delete activity and start the balance at zero" : "Restart Home Assistant after updating to enable reset"}</small
            ></span
          >
          <ha-icon icon="mdi:delete-outline" aria-hidden="true"></ha-icon>
        </button>
      </div>
      <p class="hint">
        Your balance and history are saved in Home Assistant, including after
        restarts.
      </p> `;
  }
  private renderFlow(title: string) {
    const route = this.flow.current;
    const feedback = this.error
      ? notice({
          message: this.error,
          tone: "error",
          action: this.failed
            ? {
                label:
                  this.failed.name === "reset_ledger"
                    ? "Review reset"
                    : "Retry",
                onClick: () => {
                  const failed = this.failed;
                  if (failed?.name === "reset_ledger") this.openReset();
                  else if (failed)
                    void this.mutate(
                      failed.name,
                      failed.data,
                      failed.label,
                      failed,
                    );
                },
              }
            : undefined,
        })
      : this.pending
        ? notice({
            message:
              "Waiting for Home Assistant to confirm. Closing this view will not cancel the request.",
          })
        : nothing;
    const formTitle =
      route === "add"
        ? "Add money"
        : route === "balance"
          ? "Adjust balance"
          : "Price per cup";
    return renderFamilyDialog(this.flow, {
      title:
        route === "settings"
          ? "Coffee pool settings"
          : route === "reset"
            ? "Reset ledger?"
            : route === "undo"
              ? "Undo last action?"
              : formTitle,
      className: `${route}-dialog`,
      ariaDescribedBy: route === "reset" ? "reset-description" : undefined,
      content:
        route === "reset"
          ? this.resetContent(title)
          : html`${feedback}${
              route === "settings"
                ? this.settingsContent()
                : route === "undo"
                  ? html`<p>
                      Undo “${this.undoSnapshot?.label}”? A reversal will be
                      added to the history.
                    </p>`
                  : this.editPanel()
            }`,
      footer:
        route === "reset"
          ? this.resetFooter()
          : route === "undo"
            ? html` <button
                  class="family-action"
                  data-family-initial-focus
                  @click=${() => this.flow.back()}
                >
                  Keep it
                </button>
                <button
                  class="family-action destructive"
                  data-action="confirm-undo"
                  ?disabled=${this.pending || !!this.failed || !this.online || !this.undoSnapshot}
                  @click=${() => {
                    const value = this.undoSnapshot;
                    if (value)
                      void this.mutate(
                        "undo",
                        {
                          transaction_id: value.transaction_id,
                          expected_revision: value.expected_revision,
                        },
                        "Last action undone.",
                      );
                  }}
                >
                  Undo action
                </button>`
            : undefined,
    });
  }
  protected render() {
    if (!this.config) return nothing;
    const pool = this.pool;
    const blocked = this.pending || !!this.failed || !this.online;
    const glow = buildGlow(
      {
        weak: "color-mix(in srgb,var(--coffee-accent) 10%,transparent)",
        strong: "color-mix(in srgb,var(--coffee-accent) 16%,transparent)",
      },
      "static",
      !!pool,
    );
    const latest = this.history.find((item) => item.undoable);
    const title =
      this.config.title ||
      String(
        this.hass?.states[this.config.entity]?.attributes.friendly_name ||
          "Coffee pool",
      ).replace(/ balance$/i, "");
    return html`<ha-card
      ><div class="container">
        <div class="root">
          <header class="family-header">
            <div class="brand family-brand">${icon("coffee")}</div>
            <div class="family-identity">
              <h1 class="family-title">${title}</h1>
            </div>
            <button
              class="family-icon-button"
              data-action="settings"
              aria-label="Coffee pool settings"
              aria-expanded=${this.flow.active}
              ?disabled=${!this.online}
              aria-haspopup="dialog"
              @click=${(event: Event) => this.flow.open("settings", event.currentTarget as HTMLElement)}
            >
              ${icon("settings")}
            </button>
          </header>
          ${
            !pool
              ? html`<div class="notice" role="status">
                  ${this.hass?.states[this.config.entity] ? "The coffee pool is unavailable. Controls will return when the integration reconnects." : "Select a Coffee Tracker balance sensor in the card settings."}
                </div>`
              : html`<div class="tile-wrap">
                    <div class="glow-under" style=${glow.style}>
                      ${glow.overlay}
                    </div>
                    <section
                      class="surface hero"
                      aria-label="Coffee pool balance"
                    >
                      <div class="hero-top">
                        <span class="eyebrow">Available balance</span
                        ><button
                          class="price"
                          data-action="price"
                          aria-label=${`Change price per cup, currently ${this.currency(pool.price)}`}
                          ?disabled=${blocked}
                          @click=${(event: Event) => this.open("price", event.currentTarget as HTMLElement)}
                        >
                          ${this.currency(pool.price)} / cup
                        </button>
                      </div>
                      <div class="balance-row">
                        <div class="balance-copy">
                          <strong
                            class="balance ${pool.balance < 0 ? "negative" : ""}"
                            data-balance
                            >${this.currency(pool.balance)}</strong
                          >
                          <div class="allowance">
                            ${pool.balance < 0 ? html`Add money to settle the balance.` : html`Enough for <strong>${Math.floor(Math.max(0, pool.balance) / pool.price)}</strong> ${Math.floor(Math.max(0, pool.balance) / pool.price) === 1 ? "coffee" : "coffees"}.`}
                          </div>
                        </div>
                        <div
                          class="cup-wrap ${this.celebrating ? "celebrate" : ""}"
                        >
                          ${cupArt()}${this.celebrating ? html`<span class="float-amount">−${this.currency(this.spent)}</span>` : nothing}
                        </div>
                      </div>
                      <button
                        class="purchase ${this.celebrating ? "celebrate" : ""}"
                        data-action="buy"
                        ?disabled=${blocked}
                        @click=${this.buy}
                      >
                        ${icon(this.celebrating ? "check" : "coffee")}<span
                          >${this.pending && !this.mode ? (this.pendingAction === "buy_coffee" ? "Recording…" : "Saving…") : this.celebrating ? "Enjoy your coffee" : "Coffee purchased"}</span
                        ><span class="amount"
                          >−${this.currency(pool.price)}</span
                        >
                      </button>
                      <div class="toolbar">
                        <button
                          class="tool"
                          data-action="add"
                          aria-expanded=${this.mode === "add"}
                          ?disabled=${blocked}
                          @click=${(event: Event) => this.open("add", event.currentTarget as HTMLElement)}
                        >
                          ${icon("plus")} Add money</button
                        ><button
                          class="tool"
                          data-action="balance"
                          aria-expanded=${this.mode === "balance"}
                          ?disabled=${blocked}
                          @click=${(event: Event) => this.open("balance", event.currentTarget as HTMLElement)}
                        >
                          ${icon("adjust")} Adjust balance
                        </button>
                      </div>
                    </section>
                  </div>
                  ${this.pending && this.pendingAction === "reset_ledger" && !this.resetOpen ? html`<p class="notice" role="status">Resetting ledger… Waiting for Home Assistant to confirm.</p>` : nothing}${!this.online ? html`<p class="notice" role="status">Home Assistant is disconnected. Reconnect to record a coffee.</p>` : nothing}${pool.balance < pool.price && pool.balance >= 0 ? html`<p class="notice">Time for a top-up. You can still record a coffee; the balance will go below zero.</p>` : nothing}${
                    this.error && !this.resetOpen
                      ? html`<div class="notice error" role="alert">
                          ${this.error}
                          <div class="hint">
                            ${this.failed ? "The action was not confirmed. Retry safely with the same request, or check the history before dismissing." : "This action was declined. Review the current values and try again."}
                          </div>
                          <div class="retry-actions">
                            ${
                              this.failed
                                ? html`<button
                                    class="text-button"
                                    data-action="retry"
                                    ?disabled=${this.pending || !this.online}
                                    @click=${() => {
                                      if (this.failed?.name === "reset_ledger")
                                        void this.openReset();
                                      else if (this.failed)
                                        void this.mutate(
                                          this.failed.name,
                                          this.failed.data,
                                          this.failed.label,
                                          this.failed,
                                        );
                                    }}
                                  >
                                    ${this.failed.name === "reset_ledger" ? "Review reset" : "Retry"}
                                  </button>`
                                : nothing
                            }<button
                              class="text-button"
                              data-action="dismiss"
                              ?disabled=${this.pending}
                              @click=${() => {
                                this.failed = null;
                                this.error = "";
                                void this.loadHistory();
                              }}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>`
                      : nothing
                  }${this.feedback ? notice({ message: this.feedback, tone: "success" }) : nothing}
                  <h2 class="history-heading">
                    <button
                      class="history-head"
                      data-action="activity"
                      aria-expanded=${this.activityExpanded}
                      aria-controls="coffee-activity"
                      @click=${() => {
                        this.activityExpanded = !this.activityExpanded;
                        this.undoConfirm = false;
                      }}
                    >
                      <span>Activity</span>
                      <span class="count"
                        >${pool.count}
                        ${pool.count === 1 ? "coffee" : "coffees"} enjoyed</span
                      >
                      <ha-icon
                        icon=${this.activityExpanded ? "mdi:chevron-up" : "mdi:chevron-down"}
                        aria-hidden="true"
                      ></ha-icon>
                    </button>
                  </h2>
                  <div id="coffee-activity" ?hidden=${!this.activityExpanded}>
                    ${
                      this.activityExpanded
                        ? html`<section
                              class="surface history"
                              aria-label="Coffee pool history"
                              aria-busy=${this.historyLoading}
                            >
                              ${this.history.length ? this.history.map((item) => this.entry(item)) : html`<div class="empty">${this.historyLoading ? "Loading activity…" : html`<strong>Your coffee story starts here.</strong>Add a contribution, then record your first coffee.`}</div>`}
                            </section>
                            ${this.historyError ? html`<p class="feedback" role="status">History could not be loaded. ${this.historyError}<button class="text-button" ?disabled=${this.historyLoading || !this.online} @click=${() => this.loadHistory()}>Try again</button></p>` : nothing}
                            <div class="history-actions">
                              ${
                                latest
                                  ? html`<button
                                      class="text-button"
                                      data-action="undo"
                                      ?disabled=${blocked || this.historyLoading}
                                      @click=${(event: Event) => {
                                        this.undoSnapshot = {
                                          transaction_id: latest.id,
                                          expected_revision: pool.revision,
                                          label:
                                            actionLabels[latest.kind] ||
                                            "last action",
                                        };
                                        this.flow.open(
                                          "undo",
                                          event.currentTarget as HTMLElement,
                                        );
                                      }}
                                    >
                                      ${icon("undo")} Undo last action
                                    </button>`
                                  : html`<span></span>`
                              }${this.hasMore ? html`<button class="text-button" data-action="more" ?disabled=${this.historyLoading || !this.online} @click=${() => this.loadHistory(true)}>${this.historyLoading ? "Loading…" : "Older activity"} ${icon("arrow")}</button>` : nothing}
                            </div> `
                        : nothing
                    }
                  </div>`
          }
        </div>
      </div>
      ${this.renderFlow(title)}</ha-card
    >`;
  }
}
if (!customElements.get("coffee-tracker-card"))
  customElements.define("coffee-tracker-card", CoffeeTrackerCard);
const registry = window as typeof window & {
  customCards?: Array<Record<string, unknown>>;
};
registry.customCards = registry.customCards || [];
if (!registry.customCards.some((card) => card.type === "coffee-tracker-card"))
  registry.customCards.push({
    type: "coffee-tracker-card",
    name: "Coffee Tracker",
    description:
      "A shared coffee pool with contributions, one-tap coffees, and an activity history.",
    preview: true,
  });
