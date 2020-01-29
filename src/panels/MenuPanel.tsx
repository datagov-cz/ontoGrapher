import React from 'react';

interface MenuPanelProps{
    readOnly?: boolean;
    projectName: string;
}

interface MenuPanelState{

}

export default class MenuPanel extends React.Component<MenuPanelProps, MenuPanelState>{
    constructor(props: MenuPanelProps) {
        super(props);
    }

    render(){
        return(<div>
            
        </div>);
    }
}