import React from "react";
import { ResizableBox } from "react-resizable";
import {
  AppSettings,
  PackageRoot,
  WorkspaceElements,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import PackageFolder from "./element/PackageFolder";
import PackageItem from "./element/PackageItem";
import {
  getLabelOrBlank,
  getVocabularyFromScheme,
} from "../function/FunctionGetVars";
import ModalRemoveItem from "./modal/ModalRemoveItem";
import { Form, InputGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import { parsePrefix } from "../function/FunctionEditVars";
import { Representation } from "../config/Enum";
import PackageDivider from "./element/PackageDivider";
import { Locale } from "../config/Locale";
import { Shapes } from "../config/visual/Shapes";
import { SearchTerm } from "./element/SearchTerm";
import SearchFolder from "./element/SearchFolder";
import { VocabularySelector } from "./element/VocabularySelector";
import _ from "underscore";
import {
  CacheSearchResults,
  CacheSearchVocabularies,
} from "../datatypes/CacheSearchResults";
import { searchCache } from "../queries/get/CacheQueries";
import ModalRemoveReadOnlyItem from "./modal/ModalRemoveReadOnlyItem";

interface Props {
  projectLanguage: string;
  performTransaction: (...queries: string[]) => void;
  handleWidth: Function;
  updateDetailPanel: Function;
  freeze: boolean;
  update: Function;
}

interface State {
  filter: string[];
  vocabs: { label: string; value: string }[];
  search: string;
  modalRemoveItem: boolean;
  modalRemoveReadOnlyItem: boolean;
  selectedElements: string[];
  shownElements: { [key: string]: { [key: string]: string[] } };
  selectedID: string;
  showLucene: boolean;
  shownLucene: CacheSearchResults;
  groupLucene: boolean;
}

export default class ItemPanel extends React.Component<Props, State> {
  private searchTimeout: number = 0;

  constructor(props: Props) {
    super(props);
    this.state = {
      filter: [],
      vocabs: [],
      search: "",
      modalRemoveItem: false,
      modalRemoveReadOnlyItem: false,
      selectedElements: AppSettings.selectedElements,
      shownElements: {},
      selectedID: "",
      showLucene: true,
      shownLucene: {},
      groupLucene: false,
    };
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
    this.handleOpenRemoveItemModal = this.handleOpenRemoveItemModal.bind(this);
    this.handleOpenRemoveReadOnlyItemModal = this.handleOpenRemoveReadOnlyItemModal.bind(
      this
    );
    this.updateElements = this.updateElements.bind(this);
    this.filter = this.filter.bind(this);
    this.update = this.update.bind(this);
  }

  showItem(id: string) {
    PackageRoot.children.forEach((pkg) => {
      if (!pkg.open) pkg.open = pkg.elements.includes(id);
    });
    this.setState(
      { shownElements: this.updateShownElements(), selectedID: id },
      () => {
        const itemElement = document.getElementById(this.state.selectedID);
        const parent = document.getElementById("elementList");
        if (itemElement && parent) {
          parent.scrollTo({
            top: itemElement.offsetTop - parent.offsetHeight / 2,
            left: 0,
            behavior: "smooth",
          });
        }
      }
    );
  }

  update(id?: string) {
    if (id) this.showItem(id);
    else this.forceUpdate();
  }

  updateElements() {
    this.setState({
      selectedElements: AppSettings.selectedElements,
      shownElements: this.updateShownElements(),
    });
  }

  handleChangeSearch(event: React.ChangeEvent<HTMLSelectElement>) {
    PackageRoot.children.forEach(
      (pkg) => (pkg.open = !(event.currentTarget.value === ""))
    );
    this.setState({ search: event.currentTarget.value });
    window.clearTimeout(this.searchTimeout);
    this.searchTimeout = window.setTimeout(() => {
      this.setState({
        shownElements: this.updateShownElements(),
      });
      this.getSearchResults(event.target.value);
    }, 200);
  }

  getSearchResults(term: string) {
    if (!this.state.showLucene) {
      this.setState({ shownLucene: {} });
      return;
    }
    searchCache(
      AppSettings.contextEndpoint,
      AppSettings.luceneConnector,
      term,
      this.state.vocabs.map((vocab) => vocab.value)
    ).then((results) => {
      this.setState({ shownLucene: results });
    });
  }

  sort(a: string, b: string): number {
    const aLabel = getLabelOrBlank(
      WorkspaceTerms[WorkspaceElements[a].iri].labels,
      this.props.projectLanguage
    );
    const bLabel = getLabelOrBlank(
      WorkspaceTerms[WorkspaceElements[b].iri].labels,
      this.props.projectLanguage
    );
    return aLabel.localeCompare(bLabel);
  }

  search(id: string): boolean {
    const search = this.state.search.normalize().trim().toLowerCase();
    const name = getLabelOrBlank(
      WorkspaceTerms[WorkspaceElements[id].iri].labels,
      this.props.projectLanguage
    );
    return (
      name.normalize().trim().toLowerCase().includes(search) ||
      WorkspaceTerms[WorkspaceElements[id].iri].altLabels.find(
        (alt) =>
          alt.language === this.props.projectLanguage &&
          alt.label.normalize().trim().toLowerCase().includes(search)
      ) !== undefined
    );
  }

  updateShownElements() {
    const result: { [key: string]: { [key: string]: string[] } } = {};
    PackageRoot.children.forEach((node) => {
      result[node.scheme] = {};
      Object.keys(Shapes)
        .concat("unsorted")
        .forEach((type) => (result[node.scheme][type] = []));
      if (node.open) {
        node.elements
          .sort((a, b) => this.sort(a, b))
          .filter(
            (id) =>
              this.search(id) &&
              (AppSettings.representation === Representation.FULL ||
                (AppSettings.representation === Representation.COMPACT &&
                  !(
                    WorkspaceTerms[WorkspaceElements[id].iri].types.includes(
                      parsePrefix("z-sgov-pojem", "typ-vztahu")
                    ) ||
                    WorkspaceTerms[WorkspaceElements[id].iri].types.includes(
                      parsePrefix("z-sgov-pojem", "typ-vlastnosti")
                    )
                  )))
          )
          .forEach((elem) => {
            const types = WorkspaceTerms[WorkspaceElements[elem].iri].types;
            for (const key in Shapes) {
              if (types.includes(key)) {
                result[node.scheme][key].push(elem);
                break;
              }
            }
            if (
              !Object.values(result[node.scheme]).find((arr) =>
                arr.includes(elem)
              )
            )
              result[node.scheme]["unsorted"].push(elem);
          });
      }
    });
    return result;
  }

  handleOpenRemoveItemModal(id: string) {
    this.setState({
      selectedID: id,
      modalRemoveItem: true,
    });
  }

  handleOpenRemoveReadOnlyItemModal(id: string) {
    this.setState({
      selectedID: id,
      modalRemoveReadOnlyItem: true,
    });
  }

  getFolders(): JSX.Element[] {
    let result: JSX.Element[] = [];
    for (const node of PackageRoot.children) {
      const packageItems: JSX.Element[] = [];
      for (const iri in this.state.shownElements[node.scheme]) {
        if (this.state.shownElements[node.scheme][iri].length === 0) continue;
        packageItems.push(
          <PackageDivider
            key={iri}
            iri={iri}
            items={this.state.shownElements[node.scheme][iri]}
            visible={node.open}
            projectLanguage={this.props.projectLanguage}
            update={this.updateElements}
          />
        );
        for (const id of this.state.shownElements[node.scheme][iri]) {
          packageItems.push(
            <PackageItem
              key={id}
              id={id}
              visible={node.open}
              projectLanguage={this.props.projectLanguage}
              readOnly={
                node.scheme
                  ? WorkspaceVocabularies[getVocabularyFromScheme(node.scheme)]
                      .readOnly
                  : true
              }
              update={this.updateElements}
              openRemoveItem={this.handleOpenRemoveItemModal}
              openRemoveReadOnlyItem={this.handleOpenRemoveReadOnlyItemModal}
              showDetails={this.props.updateDetailPanel}
            />
          );
        }
      }
      if (
        (this.state.vocabs.find(
          (vocab) => vocab.value === getVocabularyFromScheme(node.scheme)
        ) ||
          this.state.vocabs.length === 0) &&
        (packageItems.length > 0 || !node.open)
      )
        result.push(
          <PackageFolder
            key={node.scheme}
            projectLanguage={this.props.projectLanguage}
            node={node}
            update={this.updateElements}
            readOnly={
              WorkspaceVocabularies[getVocabularyFromScheme(node.scheme)]
                .readOnly
            }
            filter={this.filter}
          >
            {packageItems}
          </PackageFolder>
        );
    }
    return result;
  }

  getGroupLucene() {
    const vocabs = _.uniq(
      Object.keys(this.state.shownLucene)
        .map((iri) => this.state.shownLucene[iri].vocabulary)
        .filter((vocab) =>
          this.state.vocabs.length > 0
            ? this.state.vocabs.find((v) => v.value === vocab)
            : true
        )
    );
    const result: JSX.Element[] = [];
    for (const vocab of vocabs) {
      const terms = Object.keys(this.state.shownLucene).filter(
        (iri) => this.state.shownLucene[iri].vocabulary === vocab
      );
      result.push(
        <SearchFolder
          key={vocab}
          scheme={vocab}
          projectLanguage={this.props.projectLanguage}
          terms={terms}
          update={this.update}
        >
          {terms.map((iri) => (
            <SearchTerm
              projectLanguage={this.props.projectLanguage}
              key={iri}
              iri={iri}
              result={this.state.shownLucene[iri]}
              update={this.update}
            />
          ))}
        </SearchFolder>
      );
    }
    return result;
  }

  filter(vocabs: string[]) {
    const result: { label: string; value: string }[] = [];
    for (const vocab of vocabs) {
      result.push({
        label: getLabelOrBlank(
          CacheSearchVocabularies[vocab].labels,
          this.props.projectLanguage
        ),
        value: vocab,
      });
    }
    this.setState({ vocabs: result }, () => {
      if (vocabs.length > 0 || this.state.search.length > 0)
        this.getSearchResults(this.state.search);
    });
  }

  getHeight(el: string): number {
    const elem = document.getElementById(el);
    if (elem) {
      const rect = elem.getBoundingClientRect();
      return window.innerHeight - rect.y;
    }
    return 0;
  }

  render() {
    return (
      <ResizableBox
        className={"elements" + (this.props.freeze ? " disabled" : "")}
        width={300}
        height={1000}
        axis={"x"}
        handleSize={[8, 8]}
        onResizeStop={(e, d) => this.props.handleWidth(d.size.width)}
      >
        <div>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text id="inputGroupPrepend">
                <span
                  role="img"
                  aria-label={
                    Locale[AppSettings.viewLanguage].searchStereotypes
                  }
                >
                  🔎
                </span>
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              type="search"
              id={"searchInput"}
              placeholder={Locale[AppSettings.viewLanguage].searchStereotypes}
              aria-describedby="inputGroupPrepend"
              value={this.state.search}
              onChange={this.handleChangeSearch}
            />
          </InputGroup>
          <div style={{ display: "inline-flex" }}>
            <OverlayTrigger
              placement={"right"}
              overlay={
                <Tooltip id={`tooltipaaa`}>
                  Seskupit výsledky do slovníků
                </Tooltip>
              }
            >
              <button
                style={{ fontSize: "22px", margin: "2px" }}
                onClick={() =>
                  this.setState({ groupLucene: !this.state.groupLucene })
                }
                className={
                  "buttonlink" + (this.state.groupLucene ? " vocab" : "")
                }
              >
                📚
              </button>
            </OverlayTrigger>
            <VocabularySelector
              filter={this.filter}
              projectLanguage={this.props.projectLanguage}
              values={this.state.vocabs}
            />
          </div>
          <div
            id={"elementList"}
            className={"elementLinkList"}
            style={{
              height: this.getHeight("elementList").toString(10) + "px",
            }}
          >
            {this.getFolders()}
            <div>
              <div className={"lucene"}>
                <button
                  onClick={() => {
                    this.setState(
                      { showLucene: !this.state.showLucene },
                      () => {
                        if (this.state.showLucene)
                          this.getSearchResults(this.state.search);
                      }
                    );
                  }}
                  className="buttonlink"
                >
                  {this.state.showLucene ? "ᐯ " : "ᐱ "}Pojmy z ostatních
                  slovníků
                </button>
              </div>
              <div className={"hiddenLucene"}>
                {(this.state.search.length > 0 ||
                  this.state.vocabs.length > 0) &&
                  this.state.showLucene &&
                  (this.state.groupLucene
                    ? this.getGroupLucene()
                    : Object.keys(this.state.shownLucene).map((iri) => (
                        <SearchTerm
                          list
                          key={iri}
                          iri={iri}
                          result={this.state.shownLucene[iri]}
                          projectLanguage={this.props.projectLanguage}
                          update={this.update}
                        />
                      )))}
              </div>
            </div>
          </div>
          <ModalRemoveItem
            modal={this.state.modalRemoveItem}
            id={this.state.selectedID}
            close={() => {
              this.setState({ modalRemoveItem: false });
            }}
            update={() => {
              this.updateElements();
              this.updateShownElements();
              this.props.update();
            }}
            performTransaction={this.props.performTransaction}
          />
          <ModalRemoveReadOnlyItem
            modal={this.state.modalRemoveReadOnlyItem}
            id={this.state.selectedID}
            close={() => {
              this.setState({ modalRemoveReadOnlyItem: false });
            }}
            update={() => {
              this.updateElements();
              this.updateShownElements();
              this.props.update();
            }}
            performTransaction={this.props.performTransaction}
          />
        </div>
      </ResizableBox>
    );
  }
}
