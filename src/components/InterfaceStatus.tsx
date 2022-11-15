import React from "react";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { AppSettings } from "../config/Variables";
import { Locale } from "../config/Locale";
import { Environment } from "../config/Environment";

interface Props {
  handleStatus: Function;
  error: boolean;
  status: string;
}

interface State {
  connection: boolean;
}

export default class InterfaceStatus extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      connection: true,
    };
    this.setStatus = this.setStatus.bind(this);
  }

  componentDidMount() {
    if (Environment.auth && !Environment.debug)
      window.setInterval(this.setStatus, 10000);
  }

  setStatus() {
    this.checkStatus()
      .then((status) => {
        this.setState({ connection: status });
        if (
          status &&
          this.props.error &&
          this.props.status ===
            Locale[AppSettings.interfaceLanguage].errorConnectionLost
        ) {
          this.props.handleStatus(
            false,
            Locale[AppSettings.interfaceLanguage].workspaceReady,
            false,
            false
          );
        } else if (status === this.props.error && !status) {
          this.props.handleStatus(
            false,
            Locale[AppSettings.interfaceLanguage].errorConnectionLost,
            true,
            false
          );
        }
      })
      .catch(() => {
        this.setState({ connection: false });
        this.props.handleStatus(
          false,
          Locale[AppSettings.interfaceLanguage].errorConnectionLost,
          true,
          false
        );
      });
  }

  async checkStatus(): Promise<boolean> {
    if (!navigator.onLine) return false;
    else {
      const miliseconds = 5000;
      const controller = new AbortController();
      const signal = controller.signal;
      let timeout = window.setTimeout(() => controller.abort(), miliseconds);
      return await fetch(
        AppSettings.contextEndpoint +
          "?query=select%20*%20where%20%7B%3Fs%20%3Fp%20%3Fo.%7D%20limit%201",
        {
          headers: { Accept: "application/json" },
          method: "GET",
          signal,
        }
      )
        .then((response) => response.ok)
        .catch(() => false)
        .finally(() => window.clearTimeout(timeout));
    }
  }

  render() {
    return (
      <span>
        <OverlayTrigger
          placement="left"
          overlay={
            <Tooltip id="tooltipC">
              {this.state.connection
                ? Locale[AppSettings.interfaceLanguage].stableConnection
                : Locale[AppSettings.interfaceLanguage].brokenConnection}
            </Tooltip>
          }
        >
          {!this.state.connection ? (
            <Spinner animation="grow" size="sm" variant={"danger"} />
          ) : (
            <div className={"noresponse"}>🟢</div>
          )}
        </OverlayTrigger>
      </span>
    );
  }
}
