import React from "react";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { AppSettings } from "../config/Variables";
import { Locale } from "../config/Locale";
import { Environment } from "../config/Environment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import green from "@mui/material/colors/green";

const theme = createTheme({
  palette: {
    success: { main: green[600] },
  },
});

interface Props {
  loading: boolean;
  message: string;
  error: boolean;
  retry: boolean;
  performTransaction: (...queries: string[]) => void;
  handleStatus: Function;
  status: string;
}

interface State {
  connection: boolean;
}

export default class InterfaceNotification extends React.Component<
  Props,
  State
> {
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
    if (this.props.error)
      return (
        <span className={"interfaceNotification"}>
          &nbsp;
          <Spinner animation="grow" variant="danger" />
          &nbsp;
          {this.props.message}&nbsp;
          {this.props.retry && (
            <button
              className={"buttonlink"}
              onClick={() => {
                this.props.performTransaction(...AppSettings.lastTransactions);
              }}
            >
              {Locale[AppSettings.interfaceLanguage].retry}
            </button>
          )}
        </span>
      );
    else
      return (
        <span className={"interfaceNotification"}>
          {this.props.loading && (
            <span>
              &nbsp;
              <Spinner animation="border" />
              &nbsp;
            </span>
          )}
          {!this.props.message && !this.props.loading && (
            <ThemeProvider theme={theme}>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip>
                    {Locale[AppSettings.interfaceLanguage].workspaceReady}
                  </Tooltip>
                }
              >
                <CheckCircleIcon fontSize="large" color="success" />
              </OverlayTrigger>
            </ThemeProvider>
          )}
          <span className="text">{this.props.message}</span>
        </span>
      );
  }
}
