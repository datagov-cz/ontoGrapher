import React from "react";
import CloseIcon from "@mui/icons-material/Close";
type Props = {
  text: string;
  cancellable: boolean;
  onCancel?: Function;
  color: string;
  small?: boolean;
};

export const VocabularyBadge: React.FC<Props> = (props: Props) => {
  return (
    <span
      className={"chip" + (props.small ? " small" : "")}
      style={{ backgroundColor: props.color }}
    >
      {props.text}
      &nbsp;
      {props.cancellable && props.onCancel && (
        <span className="cancel" onClick={() => props.onCancel!()}>
          &nbsp;
          <CloseIcon />
        </span>
      )}
    </span>
  );
};
