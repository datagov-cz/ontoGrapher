import { enPattern } from "./enpattern";

export const csPattern: { [Property in keyof typeof enPattern]: string } =
  {} as const;
