import { useStoreState } from "pullstate";
import React, { useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { Locale, LocaleToast } from "../config/Locale";
import { StoreSettings } from "../config/Store";
import { ToastData } from "../config/ToastData";
import { AppSettings } from "../config/Variables";
import _ from "lodash";

export const ToastService: React.FC = () => {
  const toasts = useStoreState(StoreSettings, (s) => s.toastQueue);
  const checkAction = (toast: keyof typeof ToastData) =>
    LocaleToast[AppSettings.interfaceLanguage][toast].caption &&
    ToastData[toast].action;

  useEffect(() => {
    const shownToasts = localStorage.getItem("og:shownToasts");
    if (shownToasts) AppSettings.shownToasts = JSON.parse(shownToasts);
  }, []);

  return (
    <ToastContainer position="top-end">
      {toasts.map((toast, i) => (
        <Toast
          key={i}
          bg={ToastData[toast].variant ?? "light"}
          delay={ToastData[toast].dismissDelay ?? undefined}
          onClose={() => {
            if (!ToastData[toast].repeatable) {
              AppSettings.shownToasts = _.uniq([
                ...AppSettings.shownToasts,
                toast,
              ]);
              localStorage.setItem(
                "og:shownToasts",
                JSON.stringify(AppSettings.shownToasts)
              );
            }
            StoreSettings.update((s) => {
              s.toastQueue = toasts.filter((_, j) => i !== j);
            });
          }}
        >
          <Toast.Header
            closeLabel={Locale[AppSettings.interfaceLanguage].close}
          >
            <strong className="me-auto">
              {LocaleToast[AppSettings.interfaceLanguage][toast].header}
            </strong>
          </Toast.Header>
          <Toast.Body>
            <p>{LocaleToast[AppSettings.interfaceLanguage][toast].content}</p>
            {checkAction(toast) && (
              <p>
                <button
                  className="buttonlink"
                  onClick={() => ToastData[toast].action!()}
                >
                  {LocaleToast[AppSettings.interfaceLanguage][toast].caption!}
                </button>
              </p>
            )}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};
