import React, { useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { AppSettings } from "../../config/Variables";
import { Locale } from "../../config/Locale";
import { StoreAlerts } from "../../config/Store";
import { CriticalAlertData } from "../../config/CriticalAlertData";

type Props = {
  show: boolean;
};

export const CriticalAlertModal: React.FC<Props> = (props: Props) => {
  const [disabled, setDisabled] = useState<boolean>(false);

  const closeModal = () => {
    StoreAlerts.update((s) => {
      s.showCriticalAlert = !props.show;
    });
  };

  const acceptEvent = async () => {
    if (CriticalAlertData.acceptFunction) {
      if (CriticalAlertData.waitForFunctionBeforeModalClose) setDisabled(true);
      await CriticalAlertData.acceptFunction();
      setDisabled(false);
    }
    closeModal();
  };

  return (
    // keyboard events left out intentionally to (hopefully) prevent unintended actions (this is a *critical* alert after all)
    <Modal
      centered
      scrollable
      show={props.show}
      size={CriticalAlertData.modalSize}
      backdrop={"static"}
      keyboard={false}
    >
      <Modal.Header closeButton={false}>
        <Modal.Title>
          {Locale[AppSettings.interfaceLanguage].criticalAlert}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{CriticalAlertData.innerContent}</Modal.Body>
      <Modal.Footer>
        {CriticalAlertData.acceptLabel && (
          <Button
            type={"submit"}
            form={"createForm"}
            disabled={disabled}
            variant="primary"
            onClick={() => acceptEvent()}
          >
            {disabled && (
              <span>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                &nbsp;
              </span>
            )}
            {CriticalAlertData.acceptLabel}
          </Button>
        )}
        <Button onClick={() => closeModal()} variant="secondary">
          {Locale[AppSettings.interfaceLanguage].cancel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
