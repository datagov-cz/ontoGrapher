import React from "react";
import CloseIcon from "@mui/icons-material/Close";
type Props = {
  text: string;
  cancellable: boolean;
  onCancel?: Function;
  color: string;
};

export const Chip: React.FC<Props> = (props: Props) => {
  return (
    <span className="chip" style={{ backgroundColor: props.color }}>
      {props.text}
      {/* TODO */}
      {props.cancellable && props.onCancel && (
        <span className="cancel" onClick={() => props.onCancel!()}>
          &nbsp;
          <CloseIcon />
        </span>
      )}
    </span>
  );
};
