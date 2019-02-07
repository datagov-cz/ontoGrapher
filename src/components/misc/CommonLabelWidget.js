import {DefaultLabelWidget} from "storm-react-diagrams";

export class CommonLabelWidget extends DefaultLabelWidget {
    componentDidUpdate(prevProps) {

        if (prevProps.model.label !== this.props.model.label) {
            this.forceUpdate();
        }
    }

}