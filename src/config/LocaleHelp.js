// These are the strings used in the help menu. Change the values to translate that section.

import React from "react";

export var LocaleHelp = {
    "Modeling": (<div className="helpTab">
        <p>
            To place a stereotype on the canvas, drag a stereotype name from the stereotype panel (🔲) on the left panel
            onto the canvas. Clicking on the newly created stereotype opens the right panel with the details of this
            stereotype, where you can add, modify or remove attributes.
        </p>
        <p>
            In order to connect stereotypes with relationships, use the (➡) tab on the left panel, then click on the
            type of relationship you want to use. Clicking and dragging from an edge of a stereotype (a bright green
            square will appear if you hover over the edge) will create a link that you can use to connect to other
            stereotypes.
        </p>
        <p>
            To name a relationship, click on it with the shift key held down. The right panel will open up with the
            ability to label the relationship. If you right click on a relationship, a context menu will appear allowing
            you to choose a cardinality, among other options.
        </p>
        <p>
            Scrolling to zoom, clicking and dragging to pan, and holding shift and dragging to select multiple
            stereotypes is available. To delete selected diagram elements, use the delete key. Otherwise, clicking on
            the canvas will dismiss any selection.
        </p>
        <h4>Customizing elements</h4>
        <p>
            Selecting a single element of the diagram will open up the “Object details” panel on the right. If you
            selected a stereotype, you can modify the name, assign attributes, and input notes. With relationships, you
            can customize the name and notes.
        </p>
        <h4>Using languages</h4>
        <p>
            You can take advantage of multiple languages in your diagram. To change languages, use the “Selected
            language” dropdown on the top right. All inputs in the “Object details” panel apply for the currently
            selected language; for example, modifying the name of an element changes the name of that element for the
            selected language only; the names for other languages remain unchanged.
        </p>
    </div>),
    "Basic operation cheat sheet": (
        <div className="helpTab">
            <p>Here are the ways to do basic operations on the canvas laid out in a straightforward manner:</p>
            <table style={{width: "100%"}}>
                <thead>
                <tr>
                    <th>Action</th>
                    <th>Shortcut</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Select stereotype</td>
                    <td>Left click</td>
                </tr>
                <tr>
                    <td>Select relationship</td>
                    <td>Shift + left click</td>
                </tr>
                <tr>
                    <td>Select multiple elements</td>
                    <td>Shift + left click + drag</td>
                </tr>
                <tr>
                    <td>Delete selected element</td>
                    <td>Delete</td>
                </tr>
                <tr>
                    <td>Relationship context menu</td>
                    <td>Right click</td>
                </tr>
                <tr>
                    <td>Zoom</td>
                    <td>Scroll wheel</td>
                </tr>
                <tr>
                    <td>Move the diagram</td>
                    <td>Left click + drag</td>
                </tr>
                </tbody>
            </table>
        </div>
    ),
    "Advanced Features": (
        <div className="helpTab">
            <h4>Evaluation</h4>
            <p>
                Using the evaluation tool, the user can reveal failed constraint checks. Upon activating the tool, a
                bottom section appears with several parts:
            </p>
            <ul>
                <li>A table shows the constraints that failed to pass. Clicking on the number of the relationship (under
                    the # column) moves the viewpoint to the relationship in question.
                </li>
                <li>The “Reevaluate” button rechecks whether the constraints pass.</li>
                <li>The “Close” button closes the section.</li>
            </ul>
            Furthemore, relationships that fail the check turn red, and relationships that were selected via the
            evaluation table turn yellow.
            <h4>Validation</h4>
            <p>
                Validating means comparing the settings (that is, the list of available stereotypes, relationships, OCL
                constraints, cardinalities, and attribute types) to either different settings, or a particular diagram.
                In this case, you can compare an XMI input to the current settings or the current diagram, or compare
                the current diagram with the current settings. This functionality is available to you through the
                Tools->Validation menu. The results of a comparison can be seen at the bottom of the dialogue.
            </p>
            <h4>Stereotype importing</h4>
            <p>
                The component supports importing stereotypes with a .ttl file. To take advantage of this feature, either
                use the loadOntology property on use the Settings->Stereotypes… menu. From there, you can add to or
                replace the currently implemented stereotypes. </p>
            <p> When importing, the component is specifically looking for owl:Class definitions with rdf:label@language
                descriptions, where ‘language’ is the specified language code you are looking for. For example, these
                triples</p>
            <code>&lt;http://onto.fel.cvut.cz/ontologies/ufo/anti-rigid-mixin&gt; rdf:type owl:Class ;
                rdfs:subClassOf &lt;http://onto.fel.cvut.cz/ontologies/ufo/non-rigid-type&gt; ;
                rdfs:label &quot;Anti Rigid Mixin&quot;@en ,
                &quot;Antirigidn&iacute;&shy; mixin&quot;@cs .</code>
            <p>with the ‘en’ language parameter return a</p>
            <code>http://onto.fel.cvut.cz/ontologies/ufo/anti-rigid-mixin: "Anti Rigid Mixin"</code>
            <p>stereotype.</p>


            <h4>Settings export/import</h4>
            <p>
                Importing/exporting settings (that is, the list of available stereotypes, relationships, OCL
                constraints, cardinalities, and attribute types) is supported with XMI definitions. More specifically,
                the XMI definition is created with the use of the ECore standard.
            </p>
            <h4>Component properties</h4>
            <p>
                The following properties are available to you when implementing the component:
            </p>
            <ul>
                <li>loadSettings: accepts an XMI serialization to fetch settings.</li>

                <li>loadDiagram: loads a diagram from a serialization.</li>

                <li>readOnly: sets the component mode to read only mode. Any action that would alter the diagram is
                    prohibited. Accepts boolean values.
                </li>

                <li>loadOntology: loads stereotypes from a .ttl external source.</li>
            </ul>

            <h4>Local configuration</h4>
            <p>
                If you don’t want to use XMI files for configurations, or perhaps you wish to translate the component,
                you can customize the settings located in the src/config folder. In these files, you can change the
                default settings that are present without any external sources. The instructions for customizing these
                are within the files themselves.
            </p>
            <h4>Generalization sets</h4>
            <p>
                Using generalization sets, you can group together various stereotypes to recognize those sets during
                exporting. Access generalization sets in stereotypes connected with another stereotype via a
                generalization relationship.
            </p>
        </div>
    ),
    "Constraints": (<div className="helpTab">
        <p>
            Constraints are available via OCL statements on relationships. Therefore, when constructing such statements,
            following OCL syntax is required. The list of available functions and attributes of relationships is listed
            below:
        </p>
        <ul>
            <li>getSourceNode(): returns the stereotype of the source end of the relationship.</li>

            <li>getTargetNode(): returns the stereotype of the target end of the relationship.</li>

            <li>getLinktype(): the type of the relationship, for example “Generalization”.
            </li>

            <li>getName(language): the name of the relationship in a given language.
            </li>

            <li>getSourceCardinality(): the cardinality at the source end of the relationship.

            </li>

            <li>getTargetCardinality(): the cardinality at the target end of the relationship.
            </li>
        </ul>

        Of course, you can access stereotypes from relationships. Stereotypes have these available attributes:

        <ul>
            <li>getName(language): the name of the stereotype in a given language.

            </li>

            <li>getRDF(): the RDF source of the stereotype.
            </li>
            <li>getStereotype(): the type of the stereotype, for example “Kind” or “Relator”.
            </li>
            <li>getAttributes(): a list of attributes in a given language, where attribute.getName() returns the name of
                the attribute and attribute.getType() returns the type of the attribute. For example, if a stereotype
                has the following attributes:

            </li>


        </ul>
        <code>
            {'{cs: [atrObjCS1,atrObjCS2], en: [atrObjEN1,atrObjEN2]}'}
        </code>
        <p>invoking the aforementioned functions returns</p>
        <code>
            atrObjCS1.getName() = “Jméno” <br/>
            atrObjCS1.getType() = “String”<br/>
            atrObjCS2.getName() = “Věk”<br/>
            atrObjCS2.getType() = “Integer”<br/>
            atrObjEN1.getName() = “Name”<br/>
            atrObjEN1.getType() = ”String”<br/>
            atrObjEN2.getName() = “Age”<br/>
            atrObjEN2.getType() = “Integer”

        </code>


    </div>)
};