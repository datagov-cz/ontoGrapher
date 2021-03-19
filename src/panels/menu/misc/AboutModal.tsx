import React from 'react';
import {Button, Modal, Tab, Tabs} from "react-bootstrap";
import {ProjectSettings} from "../../../config/Variables";
import {Locale, LocaleChangelog} from "../../../config/Locale";

interface Props {
	modal: boolean;
	close: Function;
}

interface State {

}

export default class AboutModal extends React.Component<Props, State> {
    render() {
        return (<Modal centered scrollable show={this.props.modal} keyboard onEscapeKeyDown={() => this.props.close()}>
			<Modal.Header>
				<Modal.Title>{Locale[ProjectSettings.viewLanguage].changelog}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Tabs id={"changelog"}>
					{Object.keys(LocaleChangelog[ProjectSettings.viewLanguage]).map((year, key) =>
						<Tab title={year} key={key++} eventKey={year}>
							{Object.keys(LocaleChangelog[ProjectSettings.viewLanguage][year]).reverse().map((month) =>
								<div key={key++}>
									{Object.keys(LocaleChangelog[ProjectSettings.viewLanguage][year][month]).reverse().map((day) =>
										<div key={key++}>
											<h6 key={key++}>{`${day}. ${month}.`}</h6>
											<ul key={key++}>
												{Object.keys(LocaleChangelog[ProjectSettings.viewLanguage][year][month][day]).map((entry, i) =>
													<li key={key++}>{LocaleChangelog[ProjectSettings.viewLanguage][year][month][day][i]}</li>
												)}
											</ul>
										</div>
									)}
								</div>
							)}
						</Tab>
					)}
				</Tabs>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={() => {
					this.props.close();
				}}>{Locale[ProjectSettings.viewLanguage].close}</Button>
			</Modal.Footer>
		</Modal>);
    }
}
