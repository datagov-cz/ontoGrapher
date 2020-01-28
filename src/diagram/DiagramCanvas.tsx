import React from 'react';

interface DiagramCanvasProps {

}

interface DiagramPropsState {

}

export default class DiagramCanvas extends React.Component<DiagramCanvasProps, DiagramPropsState>{
    constructor(props: DiagramCanvasProps) {
        super(props);
    }

    componentDidMount(): void {

    }
    render(){
        return(<div>Canvas</div>);
    }
}