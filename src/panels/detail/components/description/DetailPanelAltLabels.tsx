import LabelIcon from "@mui/icons-material/Label";
import LabelOffIcon from "@mui/icons-material/LabelOff";
import classNames from "classnames";
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { LanguageObject } from "../../../../config/Languages";
import { Locale } from "../../../../config/Locale";
import {
  AlternativeLabel,
  AppSettings,
  WorkspaceTerms,
} from "../../../../config/Variables";
import { getListClassNamesObject } from "../../../../function/FunctionDraw";
import { ListItemControls } from "../items/ListItemControls";

interface Props {
  id: string;
  altLabels: { label: string; language: string }[];
  selectedLabel: LanguageObject;
  language: string;
  readOnly: boolean;
  addAltLabel: (alt: AlternativeLabel) => void;
  selectDisplayLabel: (name: string, language: string) => void;
}

export const DetailPanelAltLabels: React.FC<Props> = (props: Props) => {
  const [hover, setHover] = useState<number>(-1);

  const isAltLabelSelectedLabel = (alt: AlternativeLabel) => {
    return (
      props.selectedLabel[props.language] === alt.label &&
      props.language === alt.language
    );
  };

  const altLabels = props.altLabels.filter(
    (alt) => alt.language === props.language
  );

  return (
    <div>
      {altLabels.map((alt, i) => (
        <div
          key={i}
          className={classNames(
            "detailInput",
            "form-control",
            "form-control-sm",
            getListClassNamesObject(altLabels, i)
          )}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(-1)}
        >
          <span
            className={classNames({
              bold: isAltLabelSelectedLabel(alt),
            })}
          >
            {alt.label}
          </span>
          <span
            className={classNames("controls right", {
              hovered: i === hover,
            })}
          >
            {!props.readOnly && (
              <Button
                variant="light"
                onClick={() =>
                  props.selectDisplayLabel(
                    isAltLabelSelectedLabel(alt)
                      ? WorkspaceTerms[props.id].labels[alt.language]
                      : alt.label,
                    alt.language
                  )
                }
                className={classNames("plainButton")}
              >
                {isAltLabelSelectedLabel(alt) ? (
                  <LabelOffIcon />
                ) : (
                  <LabelIcon />
                )}
              </Button>
            )}
          </span>
        </div>
      ))}
      {altLabels.length === 0 && (
        <Form.Control
          className="detailInput noInput"
          disabled
          value=""
          size="sm"
        />
      )}
      <ListItemControls
        addAction={(label: string) => {
          if (
            label !== "" &&
            !props.altLabels.find(
              (alt) => alt.label === label && alt.language === props.language
            )
          )
            props.addAltLabel({ label: label, language: props.language });
        }}
        popover={true}
        tooltipText={
          Locale[AppSettings.interfaceLanguage].addAltLabelPlaceholder
        }
        popoverText={Locale[AppSettings.interfaceLanguage].addAltLabel}
        disableAddControl={props.readOnly}
      />
    </div>
  );
};
