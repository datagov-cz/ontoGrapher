import React, { useState } from "react";
import {
  Button,
  Form,
  OverlayTrigger,
  Popover,
  Tooltip,
} from "react-bootstrap";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
interface Props {
  addAction: Function;
  removeAction: Function;
  popover: boolean;
  tooltipText: string;
}

export const ListItemControls: React.FC<Props> = (props: Props) => {
  const [input, setInput] = useState<string>("");

  return (
    <span className="listItemControls">
      <OverlayTrigger
        placement="bottom"
        overlay={<Tooltip>{props.tooltipText}</Tooltip>}
      >
        {props.popover ? (
          <OverlayTrigger
            trigger="click"
            placement="left"
            overlay={
              <Popover>
                <Popover.Body className="listItemControlInput">
                  <Form.Control
                    size="sm"
                    value={input}
                    onChange={(event) => setInput(event.currentTarget.value)}
                    placeholder={props.tooltipText}
                  />
                  <Button
                    variant="light"
                    className={"plainButton"}
                    onClick={() => {
                      props.addAction(input);
                    }}
                  >
                    <AddIcon />
                  </Button>
                </Popover.Body>
              </Popover>
            }
          >
            <Button variant="light" className="plainButton">
              <AddIcon />
            </Button>
          </OverlayTrigger>
        ) : (
          <Button
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
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip>
            {Locale[AppSettings.interfaceLanguage].workspaceReady}
          </Tooltip>
        }
      >
        <Button
          variant="light"
          className="plainButton"
          onClick={() => props.removeAction()}
        >
          <RemoveIcon />
        </Button>
      </OverlayTrigger>
    </span>
  );
};
