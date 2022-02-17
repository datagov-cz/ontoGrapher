import React from "react";
import { Button, Modal, Tab, Tabs } from "react-bootstrap";
import { AppSettings } from "../../../config/Variables";
import { Locale, LocaleChangelog } from "../../../config/Locale";
import isUrl from "is-url";
import { enChangelog } from "../../../locale/enchangelog";

interface Props {
  modal: boolean;
  close: Function;
}

interface State {}

export default class AboutModal extends React.Component<Props, State> {
  render() {
    return (
      <Modal
        centered
        scrollable
        show={this.props.modal}
        keyboard
        onEscapeKeyDown={() => this.props.close()}
      >
        <Modal.Header>
          <Modal.Title>
            {Locale[AppSettings.interfaceLanguage].changelog}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            id={"changelog"}
            defaultActiveKey={Object.keys(enChangelog).reverse()[0]}
          >
            {Object.keys(LocaleChangelog[AppSettings.interfaceLanguage]).map(
              (year, key) => (
                <Tab title={year} key={key++} eventKey={year}>
                  {Object.keys(
                    LocaleChangelog[AppSettings.interfaceLanguage][year]
                  )
                    .reverse()
                    .map((month) => (
                      <div key={key++}>
                        {Object.keys(
                          LocaleChangelog[AppSettings.interfaceLanguage][year][
                            month
                          ]
                        )
                          .reverse()
                          .map((day) => (
                            <div key={key++}>
                              <h6 key={key++}>{`${day}. ${month}.`}</h6>
                              <ul key={key++}>
                                {Object.keys(
                                  LocaleChangelog[
                                    AppSettings.interfaceLanguage
                                  ][year][month][day]
                                ).map((entry, i) => (
                                  <li key={key++}>
                                    {isUrl(
                                      LocaleChangelog[
                                        AppSettings.interfaceLanguage
                                      ][year][month][day][i]
                                    ) ? (
                                      <a
                                        href={
                                          LocaleChangelog[
                                            AppSettings.interfaceLanguage
                                          ][year][month][day][i]
                                        }
                                      >
                                        {
                                          LocaleChangelog[
                                            AppSettings.interfaceLanguage
                                          ][year][month][day][i]
                                        }
                                      </a>
                                    ) : (
                                      LocaleChangelog[
                                        AppSettings.interfaceLanguage
                                      ][year][month][day][i]
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                      </div>
                    ))}
                </Tab>
              )
            )}
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              this.props.close();
            }}
          >
            {Locale[AppSettings.interfaceLanguage].close}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
