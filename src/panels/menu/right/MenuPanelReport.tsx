import React from "react";
import { Dropdown, SplitButton } from "react-bootstrap";
import { AppSettings } from "../../../config/Variables";
import { Locale } from "../../../config/Locale";
import { Environment } from "../../../config/Environment";

export default class MenuPanelReport extends React.Component {
  render() {
    return (
      <span>
        <SplitButton
          id={"reportIssueSplitButton"}
          className={"inert report"}
          title={Locale[AppSettings.interfaceLanguage].reportIssue}
          variant={"warning"}
          href={Environment.components["al-issue-tracker"].meta["new-bug"]}
          align={{ sm: "start" }}
          target={"_blank"}
          toggleLabel=""
        >
          <Dropdown.Item
            href={
              Environment.components["al-issue-tracker"].meta["new-feature"]
            }
            eventKey="1"
            target={"_blank"}
          >
            {Locale[AppSettings.interfaceLanguage].reportEnhancement}
          </Dropdown.Item>
        </SplitButton>
      </span>
    );
  }
}
