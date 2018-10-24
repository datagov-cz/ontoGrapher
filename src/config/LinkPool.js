import {CharacterizationLinkWidget} from "../components/links/CharacterizationLink";
import {ComponentLinkWidget} from "../components/links/ComponentLink";
import {DerivationLinkWidget} from "../components/links/DerivationLink";
import {FormalLinkWidget} from "../components/links/FormalLink";
import {MaterialLinkWidget} from "../components/links/MaterialLink";
import {MediationLinkWidget} from "../components/links/MediationLink";
import {MemberLinkWidget} from "../components/links/MemberLink";
import {SubCollectionLinkWidget} from "../components/links/SubCollectionLink";
import {SubQuantityLinkWidget} from "../components/links/SubQuantityLink";

export var LinkPool = {
    "Characterization": CharacterizationLinkWidget,
    "Component": ComponentLinkWidget,
    "Derivation": DerivationLinkWidget,
    "Formal": FormalLinkWidget,
    "Material": MaterialLinkWidget,
    "Mediation": MediationLinkWidget,
    "Member": MemberLinkWidget,
    "Subcollection": SubCollectionLinkWidget,
    "Subquantity": SubQuantityLinkWidget
};