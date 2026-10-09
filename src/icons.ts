import { html, svg } from "lit";
const paths: Record<string, unknown> = {
  coffee: svg`<path d="M5 8h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Zm12 1h1a3 3 0 0 1 0 6h-1M8 2v2m4-2v2M3 22h16"/>`,
  plus: svg`<path d="M12 5v14M5 12h14"/>`,
  settings: svg`<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>`,
  close: svg`<path d="m6 6 12 12M6 18 18 6"/>`,
  check: svg`<path d="m5 12 4 4L19 6"/>`,
  adjust: svg`<path d="m14 5 5 5M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 6Z"/>`,
  history: svg`<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7m2-4v6l4 2"/>`,
  arrow: svg`<path d="m9 5 7 7-7 7"/>`,
  undo: svg`<path d="M4 4v7h7M4 11a8 8 0 1 1 0 6"/>`,
  users: svg`<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 4a6 6 0 0 1 3 5"/>`,
};
export const icon = (name: string) =>
  html`<svg
    class="icon"
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    ${paths[name] || paths.coffee}
  </svg>`;
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
