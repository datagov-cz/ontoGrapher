import {ComponentLinkWidget} from "../components/links/ComponentLink";
import {DashedUnlabeledLinkWidget} from "../components/links/DashedUnlabeledLink";
import {MemberLinkWidget} from "../components/links/MemberLink";
import {SubCollectionLinkWidget} from "../components/links/SubCollectionLink";
import {SubQuantityLinkWidget} from "../components/links/SubQuantityLink";
import {GeneralizationLinkWidget} from "../components/links/GeneralizationLink";
import {StandardLabeledLinkWidget} from "../components/links/StandardLabeledLink";

export var LinkPool = {
    "Characterization": StandardLabeledLinkWidget,
    "Component": ComponentLinkWidget,
    "Derivation": DashedUnlabeledLinkWidget,
    "Formal": StandardLabeledLinkWidget,
    "Generalization": GeneralizationLinkWidget,
    "Material": StandardLabeledLinkWidget,
    "Mediation": StandardLabeledLinkWidget,
    "Member": MemberLinkWidget,
    "SubCollection": SubCollectionLinkWidget,
    "SubQuantity": SubQuantityLinkWidget
};