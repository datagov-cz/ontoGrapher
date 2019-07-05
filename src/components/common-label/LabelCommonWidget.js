import {DefaultLabelWidget} from "storm-react-diagrams";

export class LabelCommonWidget extends DefaultLabelWidget {
    componentDidUpdate(prevProps) {

        if (prevProps.model.label !== this.props.model.label) {
            this.forceUpdate();
        }
    }

}