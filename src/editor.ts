import { LitElement, html, css } from "lit";
import type { CardConfig, HomeAssistant } from "./types";
import { isPool } from "./model";
class CoffeeTrackerCardEditor extends LitElement {
  static properties = { hass: { attribute: false }, config: { state: true } };
  hass?: HomeAssistant;
  private config?: CardConfig;
  static styles = css`
    :host {
      display: block;
    }
    label {
      display: grid;
      gap: 8px;
      font-size: 14px;
      margin: 16px 0;
    }
    select,
    input {
      min-height: 44px;
      padding: 10px;
      font: inherit;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #222);
    }
    p {
      font-size: 12px;
      color: var(--secondary-text-color, #666);
      line-height: 1.6;
    }
  `;
  setConfig(config: CardConfig) {
    this.config = { ...config };
  }
  private change(key: string, value: string) {
    const next = { ...this.config, [key]: value };
    this.config = next as CardConfig;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: next },
        bubbles: true,
        composed: true,
      }),
    );
  }
  protected render() {
    if (!this.config) return html``;
    const pools = Object.entries(this.hass?.states || {}).filter(
      ([id, state]) => id.startsWith("sensor.") && isPool(state),
    );
    return html`<label
        >Coffee pool<select
          data-entity
          .value=${this.config.entity}
          @change=${(e: Event) => this.change("entity", (e.target as HTMLSelectElement).value)}
        >
          <option value="">Select a pool</option>
          ${pools.map(([id, state]) => html`<option value=${id}>${state.attributes.friendly_name || id}</option>`)}
        </select></label
      ><label
        >Title (optional)<input
          data-title
          .value=${this.config.title || ""}
          @input=${(e: Event) => this.change("title", (e.target as HTMLInputElement).value)}
          placeholder="Coffee pool"
      /></label>
      <p>
        ${pools.length ? "Balance, cup price, and activity are shared with everyone who can access this pool." : "Add the Coffee Tracker integration in Settings → Devices & services first."}
      </p>`;
  }
}
if (!customElements.get("coffee-tracker-card-editor"))
  customElements.define("coffee-tracker-card-editor", CoffeeTrackerCardEditor);
