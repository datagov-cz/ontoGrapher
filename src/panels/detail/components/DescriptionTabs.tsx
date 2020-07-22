import React from 'react';
import {Form, Tab, Tabs} from 'react-bootstrap';
import {Languages} from "../../../config/Variables";

interface Props {
    descriptions: { [key: string]: string };
    readOnly: boolean;
    onEdit?: Function;
    onFocusOut?: Function;
}

export default class DescriptionTabs extends React.Component<Props> {

    render() {
        return (<Tabs id={"descriptionTabs"}>
            {Object.keys(this.props.descriptions).map((lang, i) =>
                <Tab key={i} eventKey={lang} title={Languages[lang]}>
                    <Form.Control
                        as={"textarea"}
                        rows={3}
                        disabled={this.props.readOnly}
                        value={this.props.descriptions[lang]}
                        onChange={(event) => {
                            if (this.props.onEdit) this.props.onEdit(event, lang)
                        }}
                        onBlur={() => {
                            if (this.props.onFocusOut) this.props.onFocusOut()
                        }}
                    />
                </Tab>
            )}
        </Tabs>);
    }
}