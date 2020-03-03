import React from 'react';
import {ResizableBox} from "react-resizable";
import {graph} from "../var/Variables";

interface Props {

}

interface State {

}

export default class DetailPanel extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    prepareDetails(id: string){
        let model = graph.getCell(id);
        console.log(model);
    }

    render() {
        return(<ResizableBox
            width={300}
            height={1000}
            axis={"x"}
            handleSize={[8, 8]}
            resizeHandles={['nw']}
            className={"details"}>
        </ResizableBox>);
    }
}