import React from 'react';
import {Resizable, ResizableBox} from "react-resizable";

export default class ElementPanel extends React.Component<any, any>{
    render(){
        return(<ResizableBox
            className={"elements"}
            width={300}
            height={window.innerHeight-48}
            axis={"x"}
            handleSize={[8, 8]}
            resizeHandles={['se']}>
            Elements
        </ResizableBox>);
    }
}