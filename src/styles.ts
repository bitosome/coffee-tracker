import { css } from "lit";
export const styles = css`
  :host {
    display: block;
    color: var(--primary-text-color, #26352f);
    font-family: var(--paper-font-body1_-_font-family, inherit);
    --coffee-surface: var(
      --ha-card-background,
      var(--card-background-color, #fff)
    );
    --coffee-muted: var(--secondary-text-color, #69756f);
    --coffee-accent: var(--primary-color, #967956);
    --coffee-tile: color-mix(
      in srgb,
      var(--coffee-surface) 96%,
      var(--primary-text-color, #26352f) 4%
    );
  }
  * {
    box-sizing: border-box;
  }
  ha-card {
    display: block;
    background: var(--coffee-surface);
    border: 1px solid var(--divider-color, #0001);
    border-radius: var(--ha-card-border-radius, 24px);
    padding: var(--tile-padding-large);
    overflow: visible;
  }
  .container {
    container-type: inline-size;
  }
  .root {
    isolation: isolate;
    display: grid;
    gap: var(--large-gap);
  }
  button,
  input {
    font: inherit;
  }
  button {
    color: inherit;
    border: 0;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  button:disabled {
    opacity: 0.48;
    cursor: default;
  }
  button:focus-visible,
  input:focus-visible,
  summary:focus-visible {
    outline: 3px solid var(--coffee-accent);
    outline-offset: 3px;
  }
  .icon {
    display: block;
    width: 21px;
    height: 21px;
    flex: 0 0 21px;
  }
  ha-icon {
    display: block;
    width: 21px;
    height: 21px;
    flex: 0 0 21px;
    --mdc-icon-size: 21px;
  }
  .brand {
    color: var(--coffee-accent);
  }
  .family-icon-button[aria-expanded="true"] {
    color: var(--coffee-accent);
    background: color-mix(in srgb, var(--coffee-accent) 10%, transparent);
  }
  .tile-wrap {
    position: relative;
    min-width: 0;
  }
  .surface {
    position: relative;
    z-index: 1;
    background: var(--coffee-tile);
    border-radius: var(--tile-border-radius);
    box-shadow: var(--tile-shadow-default);
  }
  .hero {
    padding: 23px 22px 20px;
    overflow: hidden;
  }
  .hero-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .eyebrow {
    font-size: 12px;
    color: var(--coffee-muted);
    font-weight: 550;
    letter-spacing: 0.01em;
  }
  .price {
    display: flex;
    align-items: center;
    gap: 5px;
    border-radius: var(--chip-border-radius);
    background: color-mix(
      in srgb,
      var(--primary-text-color, #26352f) 6%,
      transparent
    );
    padding: 6px 10px;
    font-size: 11px;
    min-height: 44px;
    white-space: nowrap;
    color: var(--coffee-muted);
  }
  .balance-row {
    display: flex;
    align-items: center;
    gap: 2px;
    min-height: 159px;
  }
  .balance-copy {
    flex: 1;
    min-width: 0;
    position: relative;
    z-index: 1;
  }
  .balance {
    display: block;
    font-size: clamp(34px, 11cqw, 52px);
    line-height: 1.15;
    font-weight: 550;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.06em;
    overflow-wrap: anywhere;
  }
  .allowance {
    color: var(--coffee-muted);
    font-size: 12px;
    line-height: 1.5;
    margin-top: 10px;
  }
  .allowance strong {
    color: var(--primary-text-color, #26352f);
    font-weight: 650;
  }
  .cup-wrap {
    position: relative;
    flex: 0 0 125px;
    margin: 3px -7px 0 0;
    color: var(--coffee-accent);
  }
  .cup-art {
    display: block;
    width: 145px;
    max-width: 100%;
    transform-origin: 50% 82%;
  }
  .purchase {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    width: 100%;
    min-height: 51px;
    padding: 13px;
    border-radius: var(--chip-border-radius);
    background: var(--coffee-accent);
    color: var(--text-primary-color, #fff);
    font-size: 14px;
    font-weight: 650;
    position: relative;
    overflow: hidden;
  }
  .purchase .amount {
    white-space: nowrap;
    flex-shrink: 0;
    margin-left: auto;
    opacity: 0.85;
    font-weight: 500;
    font-size: 12px;
    padding-right: 4px;
  }
  .purchase .icon {
    margin-left: 4px;
  }
  .toolbar {
    display: flex;
    gap: 8px;
    margin-top: 11px;
  }
  .tool {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 44px;
    border-radius: var(--chip-border-radius);
    background: color-mix(
      in srgb,
      var(--primary-text-color, #26352f) 5%,
      transparent
    );
    font-size: 12px;
    font-weight: 550;
    flex: 1;
    padding: 8px;
  }
  .tool .icon {
    width: 17px;
    height: 17px;
    flex-basis: 17px;
  }
  .tool[aria-expanded="true"] {
    background: color-mix(in srgb, var(--coffee-accent) 13%, transparent);
    color: var(--coffee-accent);
  }
  .float-amount {
    position: absolute;
    top: 15px;
    left: 20px;
    right: 0;
    text-align: center;
    font-weight: 650;
    font-size: 20px;
    animation: float-up 1.8s ease-out both;
    pointer-events: none;
  }
  .celebrate .cup-art {
    animation: cup-cheers 0.75s ease-in-out;
  }
  .celebrate .steam {
    animation: steam-rise 1.8s ease-out;
  }
  .celebrate.purchase:after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      110deg,
      transparent 25%,
      #fff5 50%,
      transparent 75%
    );
    animation: shine 0.9s ease-out;
  }
  .negative {
    color: var(--status-warn-color);
  }
  .notice {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
    padding: 11px 13px;
    background: color-mix(
      in srgb,
      var(--status-warn-color) 10%,
      var(--coffee-surface)
    );
    border-radius: var(--tile-border-radius);
  }
  .error {
    color: var(--error-color, var(--status-alert-color));
    background: color-mix(
      in srgb,
      var(--status-alert-color) 7%,
      var(--coffee-surface)
    );
  }
  .feedback {
    font-size: 12px;
    line-height: 1.55;
    color: var(--coffee-muted);
    padding: 0 7px;
    margin: 0;
  }
  .feedback.success {
    color: var(--status-success-color);
  }
  h2 {
    font-size: 15px;
    font-weight: 650;
    letter-spacing: -0.015em;
    margin: 0;
  }
  .field {
    display: grid;
    gap: 7px;
    font-size: 12px;
    color: var(--coffee-muted);
    margin-top: 14px;
  }
  .field input {
    border: 1px solid var(--divider-color, #0002);
    background: var(--coffee-surface);
    color: var(--primary-text-color, #26352f);
    width: 100%;
    min-height: 48px;
    border-radius: 12px;
    padding: 10px 13px;
    font-size: 16px;
  }
  .field small {
    font-size: 11px;
    line-height: 1.5;
  }
  .presets {
    display: flex;
    gap: 7px;
    margin-top: 10px;
  }
  .presets button {
    flex: 1;
    min-height: 44px;
    border-radius: var(--chip-border-radius);
    background: color-mix(
      in srgb,
      var(--primary-text-color, #26352f) 5%,
      transparent
    );
    font-size: 12px;
  }
  .form-submit {
    margin-top: 16px;
  }
  .form-error {
    margin: 10px 0 0;
    color: var(--status-alert-color);
    font-size: 12px;
    line-height: 1.5;
  }
  .hint {
    font-size: 12px;
    line-height: 1.55;
    color: var(--coffee-muted);
    margin: 0;
  }
  .history-heading {
    margin: 0;
  }
  .history-head {
    padding: 5px 7px;
    width: 100%;
    min-height: 44px;
    border-radius: 12px;
    background: transparent;
    text-align: left;
    font-size: 14px;
    font-weight: 650;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .history-head .count {
    margin-left: auto;
    font-weight: 400;
  }
  #coffee-activity:not([hidden]) {
    display: grid;
    gap: var(--large-gap);
  }
  #coffee-activity[hidden] {
    display: none;
  }
  .count {
    font-size: 11px;
    color: var(--coffee-muted);
  }
  .history {
    padding: 0 15px;
  }
  .entry {
    display: flex;
    gap: 10px;
    align-items: center;
    min-height: 70px;
    padding: 12px 0;
    border-bottom: 1px solid
      color-mix(in srgb, var(--primary-text-color, #26352f) 7%, transparent);
  }
  .entry:last-child {
    border-bottom: 0;
  }
  .entry-icon {
    width: 33px;
    height: 33px;
    display: grid;
    place-items: center;
    flex: 0 0 33px;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #26352f) 5%,
      transparent
    );
    border-radius: 50%;
    color: var(--coffee-muted);
  }
  .entry-icon .icon {
    width: 17px;
    height: 17px;
  }
  .entry-icon.credit {
    color: var(--status-success-color);
    background: color-mix(
      in srgb,
      var(--status-success-color) 10%,
      transparent
    );
  }
  .entry-copy {
    min-width: 0;
    flex: 1;
  }
  .entry-title {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.45;
  }
  .entry-meta {
    font-size: 10px;
    color: var(--coffee-muted);
    margin-top: 4px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  .entry-note {
    font-size: 11px;
    color: var(--coffee-muted);
    line-height: 1.4;
    margin-top: 3px;
    overflow-wrap: anywhere;
  }
  .entry-value {
    text-align: right;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .entry-value.credit {
    color: var(--status-success-color);
  }
  .entry-balance {
    font-size: 10px;
    font-weight: 400;
    margin-top: 4px;
    color: var(--coffee-muted);
  }
  .text-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 44px;
    padding: 8px 10px;
    color: var(--coffee-accent);
    background: transparent;
    border-radius: 10px;
    font-size: 12px;
  }
  .text-button .icon {
    width: 16px;
    height: 16px;
    flex-basis: 16px;
  }
  .history-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 0 2px;
  }
  .empty {
    padding: 26px 10px;
    text-align: center;
    font-size: 12px;
    color: var(--coffee-muted);
    line-height: 1.7;
  }
  .empty strong {
    display: block;
    color: var(--primary-text-color, #26352f);
    font-weight: 550;
  }
  .undo-confirm {
    padding: 13px;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
  }
  .undo-confirm .hint {
    flex: 1 1 100%;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .retry-actions {
    display: flex;
    gap: 8px;
  }
  .settings-options {
    display: grid;
    gap: 2px;
  }
  .settings-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: transparent;
    width: 100%;
    text-align: left;
    padding: 8px 0;
    min-height: 51px;
  }
  .settings-option span {
    font-size: 13px;
  }
  .settings-option small {
    display: block;
    color: var(--coffee-muted);
    font-size: 11px;
    margin-top: 4px;
  }
  .settings-option ha-icon {
    color: var(--coffee-muted);
  }
  .danger-option {
    color: var(--error-color, var(--status-alert-color));
  }
  .reset-dialog .family-dialog-body p {
    font-size: 13px;
    line-height: 1.65;
    margin: 0 0 16px;
  }
  .reset-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 14px;
    background: var(--coffee-tile);
    border-radius: 12px;
    margin: 14px 0;
  }
  .reset-summary span {
    flex: 1;
    font-size: 11px;
    color: var(--coffee-muted);
  }
  .reset-summary strong {
    display: block;
    margin-top: 6px;
    font-size: 19px;
    color: var(--primary-text-color, #26352f);
  }
  @keyframes cup-cheers {
    0%,
    100% {
      transform: rotate(0) translateY(0);
    }
    35% {
      transform: rotate(-8deg) translateY(-8px);
    }
    70% {
      transform: rotate(4deg) translateY(-3px);
    }
  }
  @keyframes float-up {
    0% {
      transform: translateY(20px);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    70% {
      opacity: 1;
    }
    100% {
      transform: translateY(-20px);
      opacity: 0;
    }
  }
  @keyframes steam-rise {
    0% {
      transform: translateY(5px);
      opacity: 0.4;
    }
    100% {
      transform: translateY(-12px);
      opacity: 0;
    }
  }
  @keyframes shine {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(100%);
    }
  }
  @container (max-width:340px) {
    .hero {
      padding: 19px 15px 16px;
    }
    .cup-wrap {
      flex-basis: 103px;
      margin-right: -7px;
    }
    .balance-row {
      min-height: 145px;
    }
    .hero-top {
      gap: 6px;
    }
    .price {
      padding: 6px 8px;
      font-size: 10px;
    }
    .history {
      padding: 0 12px;
    }
    .entry {
      gap: 8px;
    }
    .entry-title {
      font-size: 11px;
    }
    .entry-value {
      font-size: 11px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *:after {
      animation: none !important;
      transition: none !important;
    }
    .float-amount {
      display: none;
    }
  }
`;
