import { enToast } from "../locale/entoast";
import { StoreSettings } from "./Store";
import { AppSettings } from "./Variables";

export const ToastData: { [Key in keyof typeof enToast]: ToastType } = {
  lookingForRelationshipsOrProperties: { repeatable: false },
};

export type ToastType = {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark";
  dismissDelay?: number;
  action?: Function;
  repeatable?: boolean;
};

export function callToast(id: keyof typeof enToast) {
  const sid = id as string;
  if (ToastData[sid].repeatable || !AppSettings.shownToasts.includes(sid)) {
    StoreSettings.update((s) => {
      s.toastQueue = [...s.toastQueue, sid];
    });
  }
}
