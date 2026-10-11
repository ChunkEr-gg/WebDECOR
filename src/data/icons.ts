export const iconPaths = {
  "arrow-up-right": [
    "M6 18 18 6",
    "M6 6h12v12"
  ],
  "arrow-left": [
    "M19 12H5",
    "m12 5-7 7 7 7"
  ],
  "arrow-right": [
    "M5 12h14",
    "m12 5 7 7-7 7"
  ],
  "arrow-up": [
    "M12 19V5",
    "m5 12 7-7 7 7"
  ],
  "arrow-down": [
    "M12 5v14",
    "m5 12 7 7 7-7"
  ],
  "arrow-down-right": [
    "M6 6 18 18",
    "M6 18h12V6"
  ],
  "branch-right": [
    "M5 4v8h14",
    "m13 6 6 6-6 6"
  ],
  "plus": [
    "M12 5v14",
    "M5 12h14"
  ],
  "minus": [
    "M5 12h14"
  ],
  "close": [
    "m6 6 12 12",
    "M6 18 18 6"
  ],
  "maximize": [
    "M5 5h14v14H5z"
  ],
  "restore": [
    "M8 8h11v11H8z",
    "M5 15H3V3h12v2"
  ],
  "refresh": [
    "M20 7v5h-5",
    "M20 12a8 8 0 1 0-2 5"
  ],
  "menu": [
    "M4 6h16M4 12h16M4 18h16"
  ],
  "asterisk": [
    "M12 1v22M1 12h22M4 4l16 16M4 20 20 4"
  ],
  "burst": [
    "m12 1 2.2 6.1L20 4l-3.1 5.8L23 12l-6.1 2.2L20 20l-5.8-3.1L12 23l-2.2-6.1L4 20l3.1-5.8L1 12l6.1-2.2L4 4l5.8 3.1Z"
  ],
  "help": [
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    "M9 8a3 3 0 0 1 6 0c0 2-3 2-3 4",
    "M12 16v.1"
  ]
} as const;
export type IconName = keyof typeof iconPaths;
