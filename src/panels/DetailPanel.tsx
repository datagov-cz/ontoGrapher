import React from 'react';
import {ResizableBox} from "react-resizable";

interface Props {

}

interface State {

}

export default class DetailPanel extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return(<ResizableBox
            width={300}
            height={1000}
            axis={"x"}
            handleSize={[8, 8]}
            resizeHandles={['nw']}
            className={"details"}>
            Details
        </ResizableBox>);
    }
}