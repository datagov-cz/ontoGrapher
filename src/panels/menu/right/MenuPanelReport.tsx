import React from "react";
import { Dropdown, SplitButton } from "react-bootstrap";
import { AppSettings } from "../../../config/Variables";
import { Locale } from "../../../config/Locale";
import { Environment } from "../../../config/Environment";

interface Props {}

interface State {}

export default class MenuPanelReport extends React.Component<Props, State> {
  render() {
    return (
      <span>
        <SplitButton
          id={"reportIssueSplitButton"}
          className={"inert report"}
          title={Locale[AppSettings.interfaceLanguage].reportIssue}
          variant={"warning"}
          href={Environment.components["al-issue-tracker"].meta["new-bug"]}
          menuAlign={{ sm: "left" }}
          target={"_blank"}
        >
          <Dropdown.Item
            href={
              Environment.components["al-issue-tracker"].meta["new-feature"]
            }
            target={"_blank"}
          >
            {Locale[AppSettings.interfaceLanguage].reportEnhancement}
          </Dropdown.Item>
        </SplitButton>
      </span>
    );
  }
}
