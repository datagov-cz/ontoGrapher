import React from 'react';
import {Nav} from "react-bootstrap";
import {ProjectSettings} from "../../config/Variables";
import {Locale} from "../../config/Locale";
import {keycloak} from "../../config/Keycloak";

interface Props {
}

interface State {
	alert: boolean;
}

export default class MenuPanelLogout extends React.Component<Props, State> {

	render() {
		return (<div className={"inert"}><Nav.Link onClick={() => keycloak.logout()}>
			{Locale[ProjectSettings.viewLanguage].logout}
		</Nav.Link>
		</div>);
	}
}