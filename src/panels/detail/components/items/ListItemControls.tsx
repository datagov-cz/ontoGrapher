import AddIcon from "@mui/icons-material/Add";
import React, { useState } from "react";
import {
  Button,
  Form,
  OverlayTrigger,
  Popover,
  Tooltip,
} from "react-bootstrap";
import { Locale } from "../../../../config/Locale";
import { AppSettings } from "../../../../config/Variables";

interface Props {
  addAction: Function;
  popover: boolean;
  popoverText?: string;
  tooltipText: string;
  disableAddControl: boolean;
}

export const ListItemControls: React.FC<Props> = (props: Props) => {
  const [input, setInput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPopover, setShowPopover] = useState<boolean>(false);

  const submit = () => {
    if (input.length !== 0) {
      setShowPopover(false);
      props.addAction(input);
    } else {
      setError(Locale[AppSettings.interfaceLanguage].addAltLabelNoName);
    }
  };

  return (
    <span className="listItemControls">
      <OverlayTrigger
        placement="bottom"
        delay={1000}
        overlay={<Tooltip>{props.tooltipText}</Tooltip>}
      >
        {props.popover ? (
          <OverlayTrigger
            trigger={[]}
            show={showPopover}
            placement="left"
            overlay={
              <Popover>
                <Popover.Body className="listItemControlInput">
                  <OverlayTrigger
                    placement="bottom"
                    show={!!error}
                    overlay={<Tooltip>{error}</Tooltip>}
                  >
                    <Form.Control
                      autoFocus
                      size="sm"
                      value={input}
                      onChange={(event) => setInput(event.currentTarget.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") submit();
                      }}
                      onBlur={() => setShowPopover(false)}
                      placeholder={
                        props.popoverText
                          ? props.popoverText
                          : props.tooltipText
                      }
                    />
                  </OverlayTrigger>
                  &nbsp;
                  <Button
                    variant="light"
                    className={"plainButton"}
                    onClick={submit}
                  >
                    <AddIcon />
                  </Button>
                </Popover.Body>
              </Popover>
            }
          >
            <Button
              disabled={props.disableAddControl}
              variant="light"
              className="plainButton"
              onClick={() => {
                setShowPopover(true);
                setInput("");
              }}
            >
              <AddIcon />
            </Button>
          </OverlayTrigger>
        ) : (
          <Button
            disabled={props.disableAddControl}
            variant="light"
            className="plainButton"
            onClick={() => {
              props.addAction();
            }}
          >
            <AddIcon />
          </Button>
        )}
      </OverlayTrigger>
    </span>
  );
};
