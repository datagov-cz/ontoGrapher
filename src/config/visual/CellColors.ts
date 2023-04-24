/**
 * Describes the highlight colors of the cells in various states.
 */
export const CellColors: { [key: string]: string } = {
  default: "#000000",
  detail: "#0000FF",
  select: "#FF9037",
  invalid: "#FF0000",
  invalidSelect: "#FFFF00",
} as const;
