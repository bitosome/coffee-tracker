import { html } from "lit";
import { uiIcon, UI_ICONS } from "./shared/card-primitives";

const aliases: Record<string, keyof typeof UI_ICONS> = {
  settings: "settings",
  plus: "add",
  close: "close",
  check: "check",
  adjust: "edit",
  history: "history",
  arrow: "next",
  undo: "undo",
};
/** Standard controls use the same MDI vocabulary as every family card. */
export const icon = (name: string) =>
  aliases[name]
    ? uiIcon(aliases[name])
    : html`<ha-icon icon="mdi:coffee-outline" aria-hidden="true"></ha-icon>`;

export const cupArt = () =>
  html`<svg
    class="cup-art"
    aria-hidden="true"
    viewBox="0 0 180 156"
    fill="none"
  >
    <ellipse
      cx="87"
      cy="132"
      rx="66"
      ry="13"
      fill="currentColor"
      opacity=".055"
    />
    <ellipse
      cx="87"
      cy="128"
      rx="57"
      ry="10"
      fill="currentColor"
      opacity=".11"
    />
    <path
      d="M126 64h12c21 0 21 32 0 32h-14"
      stroke="currentColor"
      stroke-width="9"
      opacity=".72"
    />
    <path
      d="M41 55h87v37c0 22-16 35-43 35S41 114 41 92V55Z"
      fill="currentColor"
      opacity=".88"
    />
    <ellipse cx="84.5" cy="55" rx="43.5" ry="12" fill="currentColor" />
    <ellipse
      cx="84.5"
      cy="56"
      rx="35.5"
      ry="7"
      fill="var(--coffee-surface)"
      opacity=".75"
    />
    <path
      d="M56 74v16c0 10 3 17 9 21"
      stroke="var(--coffee-surface)"
      opacity=".4"
      stroke-width="4"
      stroke-linecap="round"
    />
    <g
      class="steam"
      stroke="currentColor"
      stroke-width="3.5"
      stroke-linecap="round"
      opacity=".4"
    >
      <path class="steam-one" d="M67 35c-10-11 10-13 0-25" />
      <path class="steam-two" d="M86 30c-10-11 10-13 0-25" />
      <path class="steam-three" d="M105 35c-10-11 10-13 0-25" />
    </g>
  </svg>`;
