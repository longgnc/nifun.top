<script setup>
defineProps({ service: { type: String, required: true } });
</script>

<template>
  <svg class="service-artwork" viewBox="0 0 160 90" fill="none" aria-hidden="true">
    <g v-if="service === 'workbench'">
      <rect class="art-back" x="30" y="9" width="114" height="68" rx="9" />
      <rect class="art-panel" x="15" y="17" width="114" height="66" rx="8" />
      <path class="art-line" d="M15 32h114M44 32v51" />
      <circle class="art-accent" cx="24" cy="25" r="2" />
      <circle class="art-soft" cx="32" cy="25" r="2" />
      <path class="art-line" d="M24 43h11m-11 9h8m-8 9h11" />
      <rect class="art-soft" x="53" y="41" width="29" height="14" rx="4" />
      <rect class="art-back" x="89" y="41" width="29" height="14" rx="4" />
      <path class="art-line" d="M54 64h39m-39 9h54" />
      <rect class="art-badge" x="112" y="57" width="31" height="28" rx="8" />
      <path class="art-check" d="m120 71 5 5 10-11" />
    </g>
    <g v-else-if="service === 'drive'">
      <path class="art-back" d="M25 29a8 8 0 0 1 8-8h29l9 9h51a8 8 0 0 1 8 8v37H25Z" />
      <g class="art-floating">
        <rect
          class="art-panel"
          x="63"
          y="9"
          width="44"
          height="52"
          rx="5"
          transform="rotate(10 85 35)"
        />
        <path class="art-line" d="m75 24 20 3m-21 5 20 3m-21 5 13 2" />
      </g>
      <path
        class="art-folder"
        d="M21 46a7 7 0 0 1 7-8h34l8 8h64a6 6 0 0 1 6 7l-5 24a8 8 0 0 1-8 7H34a8 8 0 0 1-8-7Z"
      />
      <path class="art-check" d="M87 68h17a6 6 0 0 0 0-12 9 9 0 0 0-17-1 7 7 0 0 0 0 13Z" />
    </g>
    <g v-else-if="service === 'send'">
      <rect
        class="art-panel"
        x="17"
        y="26"
        width="43"
        height="55"
        rx="7"
        transform="rotate(-9 38 53)"
      />
      <path class="art-line" d="m28 44 18-3m-17 11 18-3m-16 11 11-2" />
      <path class="art-route" d="M55 40c30-35 57-22 58 4" />
      <path class="art-check" d="m105 36 9 9 6-11" />
      <g class="art-floating">
        <rect class="art-badge" x="79" y="48" width="63" height="29" rx="14" />
        <path
          class="art-check"
          d="m103 65 8-7m-7 12-3 2a6 6 0 0 1-8-9l6-5a6 6 0 0 1 8 0m4-4 3-2a6 6 0 0 1 8 9l-6 5a6 6 0 0 1-8 0"
        />
      </g>
    </g>
    <g v-else-if="service === 'p2p'">
      <rect class="art-panel" x="14" y="16" width="92" height="57" rx="7" />
      <path class="art-line" d="M14 62h92M52 74v9m-15 0h40" />
      <path class="art-route" d="M49 41h63m-6-6 7 6-7 6M112 53H49m6-6-7 6 7 6" />
      <g class="art-floating">
        <rect class="art-panel" x="112" y="30" width="32" height="55" rx="7" />
        <rect class="art-soft" x="117" y="38" width="22" height="34" rx="3" />
        <path class="art-line" d="M124 78h8" />
      </g>
    </g>
    <g v-else-if="service === 'memos'">
      <rect
        class="art-back"
        x="49"
        y="15"
        width="76"
        height="66"
        rx="8"
        transform="rotate(9 87 48)"
      />
      <rect
        class="art-panel"
        x="30"
        y="11"
        width="76"
        height="69"
        rx="8"
        transform="rotate(-5 68 45)"
      />
      <rect class="art-soft" x="53" y="7" width="33" height="11" rx="4" />
      <path class="art-check" d="m43 32 3 3 5-7m-7 20 3 3 5-7" />
      <path class="art-line" d="m60 31 29-2m-28 18 22-2m-36 19 42-4" />
      <path class="art-pencil art-floating" d="m107 76-7 3 1-8 24-31 7 5Z" />
    </g>
    <g v-else-if="service === 'video'">
      <rect class="art-back" x="28" y="10" width="115" height="63" rx="9" />
      <rect class="art-panel" x="16" y="20" width="115" height="63" rx="9" />
      <path
        class="art-landscape"
        d="m17 63 27-23 25 17 20-13 41 25v5a8 8 0 0 1-8 8H25a8 8 0 0 1-8-8Z"
      />
      <circle class="art-badge art-floating" cx="76" cy="48" r="16" />
      <path class="art-play" d="m72 40 12 8-12 8Z" />
      <path class="art-line" d="M29 73h89" />
      <path class="art-check" d="M29 73h33" />
      <circle class="art-accent" cx="62" cy="73" r="3" />
    </g>
  </svg>
</template>
