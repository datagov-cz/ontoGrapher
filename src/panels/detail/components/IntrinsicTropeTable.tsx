import React from "react";
import TableList from "../../../components/TableList";
import { WorkspaceTerms } from "../../../config/Variables";
import {
  getElemFromIRI,
  getLabelOrBlank,
} from "../../../function/FunctionGetVars";
import { IntrinsicTropeTableSelect } from "./IntrinsicTropeTableSelect";

interface Props {
  iri: string;
  tropes: string[];
  onEdit: Function;
  onRemove: Function;
  onAdd: Function;
  onCreate: Function;
  readOnly: boolean;
  projectLanguage: string;
}

export const IntrinsicTropeTable: React.FC<Props> = (props) => {
  return (
    <TableList>
      {props.tropes.map((iri, i) => (
        <tr key={i}>
          <td colSpan={props.readOnly ? 2 : 1} className={"stretch"}>
            {getLabelOrBlank(WorkspaceTerms[iri].labels, props.projectLanguage)}
          </td>
          <td className={"short"}>
            <span className={"right"}>
              <button
                className={"buttonlink"}
                onClick={() => props.onEdit(getElemFromIRI(iri))}
              >
                <span role="img" aria-label={"View intrinsic trope"}>
                  📝
                </span>
              </button>
            </span>
          </td>
          {!props.readOnly && (
            <td className={"short"}>
              <span className={"right"}>
                <button
                  className={"buttonlink"}
                  onClick={() => props.onRemove(getElemFromIRI(iri))}
                >
                  <span role="img" aria-label={"Remove intrinsic trope"}>
                    ➖
                  </span>
                </button>
              </span>
            </td>
          )}
        </tr>
      ))}
      {!props.readOnly && (
        <tr>
          <td colSpan={2}>
            <IntrinsicTropeTableSelect
              projectLanguage={props.projectLanguage}
              iri={props.iri}
              handleChange={(value: string) => {
                props.onAdd(getElemFromIRI(value));
              }}
              tropes={props.tropes}
            />
          </td>
          <td className={"short"}>
            <button
              className={"buttonlink"}
              onClick={() => {
                props.onCreate();
              }}
            >
              <span role="img" aria-label={"Create new intrinsic trope"}>
                ➕
              </span>
            </button>
          </td>
        </tr>
      )}
    </TableList>
  );
};
