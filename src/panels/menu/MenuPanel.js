import React from 'react';
import {FormControl} from "react-bootstrap";
import {LanguagePool} from "../../config/Variables";
import {Locale} from "../../config/locale/Locale";


export class MenuPanel extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        let languagePool = Object.keys(LanguagePool).map((language) => {
            return (
                <option key={language} value={language}>{LanguagePool[language]}</option>
            )
        });

        return (
            <div className="menuPanel">
                {this.props.children}
                <span className="center">
                        {this.props.name}
                    </span>
                <span className="right">
                        {Locale.selectedLanguage + ": "}
                    <FormControl componentClass="select" bsSize="small" value={this.props.language}
                                 onChange={this.props.handleChangeLanguage}>
                            {languagePool}
                        </FormControl>
                    </span>

            </div>
        );


    }

}