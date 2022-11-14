import React from "react";
import SvgIcon from "@mui/material/SvgIcon";

type Props = {
  text: string;
  icon: typeof SvgIcon;
};

export const IconText: React.FC<Props> = (props: Props) => {
  return (
    <span className="iconButton">
      {props.icon}&nbsp;{props.text}
    </span>
  );
};
