<script setup>
defineProps({ name: { type: String, default: "arrow" } });
const paths = {
  arrow: "M4 12h16m-6-6 6 6-6 6",
  external: "M7 17 17 7M7 7h10v10",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  close: "m6 6 12 12M6 18 18 6",
  terminal: "m5 7 5 5-5 5m8 0h6M3 3h18v18H3z",
  game: "M7 6h10c3 0 5 11 3 12-2 1-4-3-5-3H9c-1 0-3 4-5 3C2 17 4 6 7 6ZM7 9v5m-2-2.5h4m7-2h.01m2 3h.01",
  music: "M9 18V5l11-2v13M9 8l11-2M9 18a3 3 0 1 1-3-3c2 0 3 1 3 3m11-2a3 3 0 1 1-3-3c2 0 3 1 3 3",
  compass: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM16 8l-3 5-5 3 3-5 5-3Z",
  chat: "M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4ZM8 11h8",
  film: "M3 4h18v16H3zM7 4v16M17 4v16M3 8h4m-4 8h4M17 8h4m-4 8h4",
  book: "M12 5v16M12 5C8 2 3 3 2 4v15c3-2 7-1 10 2 3-3 7-4 10-2V4c-1-1-6-2-10 1Z",
  clock: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 6v6l4 2",
  image: "M3 3h18v18H3zM3 17l6-6 4 4 3-3 5 5M16 7h.01",
  refresh: "M20 7a9 9 0 1 0 1 8M20 3v5h-5",
  sun: "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5",
  moon: "M21 13A9 9 0 0 1 11 3 9 9 0 1 0 21 13Z",
  settings: "M4 7h16M4 17h16M9 4v6m6 4v6",
  github:
    "M9 19c-4 1-4-2-6-2m14 5v-4c0-1-.3-2-1-2 4-.5 6-2 6-6 0-2-.7-3-2-4 0-1 0-3-.5-4-2 0-3 1-4 2a13 13 0 0 0-7 0C7 3 6 2 4 2c-.5 1-.5 3 0 4-1 1-2 2-2 4 0 4 2 5.5 6 6-.7.5-1 1-1 2v4",
};
</script>
<template>
  <svg
    class="glyph"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] || paths.arrow" />
  </svg>
</template>
