import React from "react";
import { Form } from "react-bootstrap";
import { CardinalityPool, WorkspaceLinks } from "../../../../config/Variables";
import {
  getLabelOrBlank,
  getLinkOrVocabElem,
} from "../../../../function/FunctionGetVars";

interface Props {
  linkID: string;
  selectedLanguage: string;
  readOnly: boolean;
  sourceCardinality: string;
  targetCardinality: string;
  setSourceCardinality: (c: string) => void;
  setTargetCardinality: (c: string) => void;
}

export const DetailPanelCardinalities: React.FC<Props> = (props: Props) => {
  return (
    <div className="linkCardinalities">
      <Form.Control
        size="sm"
        onChange={(event) => props.setSourceCardinality(event.target.value)}
        as="select"
        value={props.sourceCardinality}
        disabled={props.readOnly}
      >
        {CardinalityPool.map((card, i) => (
          <option
            key={i}
            disabled={i.toString(10) === props.sourceCardinality}
            value={i.toString(10)}
          >
            {card.getString()}
          </option>
        ))}
      </Form.Control>
      {props.linkID in WorkspaceLinks && (
        <span className="plainButton">
          {getLabelOrBlank(
            getLinkOrVocabElem(WorkspaceLinks[props.linkID].iri).labels,
            props.selectedLanguage
          )}
        </span>
      )}
      <Form.Control
        size="sm"
        onChange={(event) => props.setTargetCardinality(event.target.value)}
        as="select"
        value={props.targetCardinality}
        disabled={props.readOnly}
      >
        {CardinalityPool.map((card, i) => (
          <option
            key={i}
            disabled={i.toString(10) === props.targetCardinality}
            value={i.toString(10)}
          >
            {card.getString()}
          </option>
        ))}
      </Form.Control>
      <svg
        width="100%"
        height="24px"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="line"
      >
        <defs>
          <marker
            id={"link"}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerUnits="strokeWidth"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#000" />
          </marker>
        </defs>
        <line
          x1="2%"
          y1="50%"
          x2="100%"
          y2="50%"
          strokeWidth="2"
          stroke="#000"
          markerEnd={"url(#link)"}
        />
      </svg>
    </div>
  );
};
