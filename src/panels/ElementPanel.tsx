import React from 'react';
import {Resizable, ResizableBox} from "react-resizable";
import {InputGroup, Form} from "react-bootstrap";
import * as LocaleMain from "../locale/LocaleMain.json";
import Select from 'react-select';
import {StereotypeCategories, Stereotypes, ViewSettings} from "../var/Variables";
import StereotypeElementItem from "./elements/StereotypeElementItem";
import * as Helper from "./../misc/Helper";

interface Props{
    projectLanguage: string;
}

interface State {
    filter: string[];
    search: string;
}

export default class ElementPanel extends React.Component<Props, State>{

    private categories: {}[];
    private stereotypes: string[];

    constructor(props: Props) {
        super(props);

        this.state = {
            filter: [],
            search: ""
        };
        this.categories = [];
        this.stereotypes = Object.keys(Stereotypes);
        this.prepareCategories();
        this.handleChangeSelect = this.handleChangeSelect.bind(this);
        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.handleGetInfo = this.handleGetInfo.bind(this);
        this.search = this.search.bind(this);
    }

    search(search: string, filter: string[]){
        let result = [];
        for (let stereotype in Stereotypes){
            if ((filter.includes(Stereotypes[stereotype].category) || filter.length === 0)
                    && (
                        //Stereotypes[stereotype].suffix.startsWith(this.state.search) ||
                    Stereotypes[stereotype].labels[this.props.projectLanguage].startsWith(search)
                )){
                result.push(stereotype);
            }
        }
        this.stereotypes = result;
    }

    handleGetInfo(element: string){
        console.log(element);
    }

    handleChangeSelect(event: any){
        let result = [];
        if (Array.isArray(event)){
            for (let e of event){
                result.push(e.value);
            }
        }
        this.setState({filter: result});
        this.search(this.state.search, result);
        this.forceUpdate();
    }

    handleChangeSearch(event: React.FormEvent<HTMLInputElement>){
        this.setState({search: event.currentTarget.value});
        this.search(event.currentTarget.value, this.state.filter);
        this.forceUpdate();
    }

    prepareCategories(){
        let result = [];
        for (let category of StereotypeCategories){
            result.push({
                value: category,
                label: category
            });
        }
        this.categories = result;
    }

    getName(element: string){
        if (ViewSettings.display == 1){
            return Helper.getNameOfStereotype(element);
        } else {
            return Stereotypes[element].labels[this.props.projectLanguage];
        }
    }

    render(){
        return(<ResizableBox
            className={"elements"}
            width={300}
            height={1000}
            axis={"x"}
            handleSize={[8, 8]}
            resizeHandles={['ne']}>

            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text id="inputGroupPrepend">🔎</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                    type="text"
                    placeholder={LocaleMain.searchStereotypes}
                    aria-describedby="inputGroupPrepend"
                    value={this.state.search}
                    onChange={this.handleChangeSearch}
                />
            </InputGroup>
                <Select
                    isMulti
                    closeMenuOnSelect={false}
                    options={this.categories}
                    onChange={this.handleChangeSelect}
                    placeholder={LocaleMain.filter}
                />
                <div className={"elementList"}>
                    {this.stereotypes.map((element)=>(<StereotypeElementItem
                        key={element}
                        element={element}
                        label={this.getName(element)}
                        category={Stereotypes[element].category}
                        onMouseOver={() => {this.handleGetInfo(element);}}
                    />))}
                </div>
                <div className={"elementDescription"}>
                    desc
                </div>
        </ResizableBox>);
    }
}