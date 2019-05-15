export var Scenario3Load = "" +
    "{\"id\":\"3ec8be59-ce8b-4a81-aebe-64afbb42e8ac\",\"offsetX\":0,\"offsetY\":0,\"zoom\":100,\"gridSize\":0,\"selectedLink\":\"Generalization\",\"language\":\"en\",\"firstCardinality\":\"None\",\"secondCardinality\":\"None\",\"name\":\"Untitled Diagram\",\"notes\":\"\",\"links\":[{\"id\":\"5f745384-4c5e-4f81-b310-89df67088f0b\",\"type\":\"link-common\",\"selected\":false,\"source\":\"f9977ec9-fb29-486a-8b56-da9faa7e4ff3\",\"sourcePort\":\"1d767656-7905-48b4-8e73-8579cc88e68d\",\"target\":\"22639dec-b2d7-4d51-913a-01896584dfbe\",\"targetPort\":\"3e26735e-fe3d-493b-8134-94218b40a85d\",\"points\":[{\"id\":\"8cd99ada-b945-43cd-a2e1-f7bf799d2750\",\"selected\":false,\"x\":233.171875,\"y\":555},{\"id\":\"113e72ee-637e-4ade-b2cf-f37e5665aa2e\",\"selected\":true,\"x\":290.171875,\"y\":251}],\"extras\":{},\"labels\":[{\"id\":\"740715fd-d136-4cd4-bb73-705159222217\",\"type\":\"default\",\"selected\":false,\"offsetX\":0,\"offsetY\":-23,\"label\":\"\"},{\"id\":\"4e3aa963-50a2-4bfe-ab0a-29775d0f1ab2\",\"type\":\"default\",\"selected\":false,\"offsetX\":0,\"offsetY\":-23,\"label\":\"\"},{\"id\":\"e6db602f-8c88-4243-bfbd-8b4cd6528ec0\",\"type\":\"default\",\"selected\":false,\"offsetX\":0,\"offsetY\":-23,\"label\":\"\"},{\"id\":\"61a4d8cb-9bd0-4ca6-8492-4ab8117a4855\",\"type\":\"default\",\"selected\":false,\"offsetX\":0,\"offsetY\":-23,\"label\":\"\"}],\"width\":3,\"color\":\"black\",\"curvyness\":0,\"linkType\":\"Generalization\",\"names\":{\"cs\":\"\",\"en\":\"\"},\"sourceCardinality\":\"None\",\"targetCardinality\":\"None\",\"dashed\":false,\"notes\":{},\"constraints\":[],\"descriptor\":false,\"linkEnd\":\"UnfilledArrow\",\"labeled\":false}],\"nodes\":[{\"id\":\"22639dec-b2d7-4d51-913a-01896584dfbe\",\"type\":\"common\",\"selected\":true,\"x\":215.171875,\"y\":203,\"extras\":{},\"ports\":[{\"id\":\"5695a151-02a5-459f-9f20-05bff4b3c6be\",\"type\":\"common\",\"selected\":false,\"name\":\"left\",\"parentNode\":\"22639dec-b2d7-4d51-913a-01896584dfbe\",\"links\":[],\"position\":\"left\"},{\"id\":\"374d38f6-23e5-49fb-b6f5-85f17c8c600e\",\"type\":\"common\",\"selected\":false,\"name\":\"right\",\"parentNode\":\"22639dec-b2d7-4d51-913a-01896584dfbe\",\"links\":[],\"position\":\"right\"},{\"id\":\"bdb4d621-a676-492b-a332-3eb98ba41d09\",\"type\":\"common\",\"selected\":false,\"name\":\"top\",\"parentNode\":\"22639dec-b2d7-4d51-913a-01896584dfbe\",\"links\":[],\"position\":\"top\"},{\"id\":\"3e26735e-fe3d-493b-8134-94218b40a85d\",\"type\":\"common\",\"selected\":false,\"name\":\"bottom\",\"parentNode\":\"22639dec-b2d7-4d51-913a-01896584dfbe\",\"links\":[\"5f745384-4c5e-4f81-b310-89df67088f0b\"],\"position\":\"bottom\"}],\"stereotype\":\"Kind\",\"attributes\":{\"cs\":[],\"en\":[]},\"names\":{\"cs\":\"Person\",\"en\":\"Person\"},\"rdf\":\"http://onto.fel.cvut.cz/ontologies/ufo/kind\",\"notes\":{\"cs\":\"\",\"en\":\"\"}},{\"id\":\"f9977ec9-fb29-486a-8b56-da9faa7e4ff3\",\"type\":\"common\",\"selected\":false,\"x\":158.171875,\"y\":555,\"extras\":{},\"ports\":[{\"id\":\"769da601-f882-4d3d-90e0-590fb300ec03\",\"type\":\"common\",\"selected\":false,\"name\":\"left\",\"parentNode\":\"f9977ec9-fb29-486a-8b56-da9faa7e4ff3\",\"links\":[],\"position\":\"left\"},{\"id\":\"8d58da17-77a5-4518-989b-4e17dbaf0353\",\"type\":\"common\",\"selected\":false,\"name\":\"right\",\"parentNode\":\"f9977ec9-fb29-486a-8b56-da9faa7e4ff3\",\"links\":[],\"position\":\"right\"},{\"id\":\"1d767656-7905-48b4-8e73-8579cc88e68d\",\"type\":\"common\",\"selected\":false,\"name\":\"top\",\"parentNode\":\"f9977ec9-fb29-486a-8b56-da9faa7e4ff3\",\"links\":[\"5f745384-4c5e-4f81-b310-89df67088f0b\"],\"position\":\"top\"},{\"id\":\"048a24d7-3571-4dcb-8b9f-3f3c734f5abf\",\"type\":\"common\",\"selected\":false,\"name\":\"bottom\",\"parentNode\":\"f9977ec9-fb29-486a-8b56-da9faa7e4ff3\",\"links\":[],\"position\":\"bottom\"}],\"stereotype\":\"Kind\",\"attributes\":{\"cs\":[],\"en\":[]},\"names\":{\"cs\":\"untitled\",\"en\":\"untitled\"},\"rdf\":\"http://onto.fel.cvut.cz/ontologies/ufo/kind\",\"notes\":{\"cs\":\"\",\"en\":\"\"}}],\"languages\":[[\"cs\",\"Čeština\"],[\"en\",\"English\"]],\"generalizations\":[]}";

export var Scenario3Settings = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<ecore:EPackage xmi:version=\"2.0\" xmlns:xmi=\"http://www.omg.org/XMI\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:ecore=\"http://www.eclipse.org/emf/2002/Ecore\" name=\"People\" nsURI=\"www.example.com/people\" nsPrefix=\"ppl\">\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Stereotype\" abstract=\"true\" interface=\"false\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Relationship\" abstract=\"true\" interface=\"false\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"AttributeType\" abstract=\"true\" interface=\"false\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Cardinality\" abstract=\"true\" interface=\"false\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Language\" abstract=\"true\" interface=\"false\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Object\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/object\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Entity\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/entity\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Trope\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/trope\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Relator\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/relator\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Endurant\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/endurant\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Anti Rigid Mixin\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/anti-rigid-mixin\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Non Rigid Mixin\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/non-rigid-type\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Anti Rigid Sortal\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/anti-rigid-sortal\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Sortal Type\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/sortal-type\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Category\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/category\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Rigid Mixin\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/rigid-mixin\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Collective\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/collective\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Substance sortal\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/substance-sortal\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Endurant Type\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/endurant-type\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Type\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/type\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Individual\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/individual\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Intrinsic Trope\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/intrinsic-trope\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Intrinsic Trope Type\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/intrinsic-trope-type\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Moment Type\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/trope-type\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Kind\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/kind\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Mixin\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/mixin\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Mixin Type\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/mixin-type\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Mode Type\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/mode-type\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Monadic Type\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/monadic-type\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Object Type\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/object-type\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Substantial Type\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/substantial-type\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Phase\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/phase\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Quality Type\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/quality-type\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Quantity\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/quantity\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Relator Type\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/relator-type\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Rigid Sortal\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/rigid-sortal\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Role\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/role\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Role Mixin\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/role-mixin\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Sub-kind\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Stereotype\">\n" +
    "        <eAnnotations source=\"http://www.w3.org/1999/02/22-rdf-syntax-ns\">\n" +
    "            <details key=\"rdf\" value=\"http://onto.fel.cvut.cz/ontologies/ufo/sub-kind\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Characterization\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Relationship\">\n" +
    "        <eAnnotations source=\"linkEnd\">\n" +
    "            <details key=\"linkEnd\" value=\"Empty\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"labeled\">\n" +
    "            <details key=\"labeled\" value=\"true\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"dashed\">\n" +
    "            <details key=\"dashed\" value=\"false\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"http://www.eclipse.org/ocl/examples/OCL\">\n" +
    "            <details key=\"constraint\" value=\"self.sourceCardinality = &quot;1&quot;\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"http://www.eclipse.org/ocl/examples/OCL\">\n" +
    "            <details key=\"constraint\" value=\"self.targetCardinality = &quot;1&quot;\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Component\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Relationship\">\n" +
    "        <eAnnotations source=\"linkEnd\">\n" +
    "            <details key=\"linkEnd\" value=\"FilledEmptyDiamond\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"labeled\">\n" +
    "            <details key=\"labeled\" value=\"false\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"dashed\">\n" +
    "            <details key=\"dashed\" value=\"false\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Derivation\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Relationship\">\n" +
    "        <eAnnotations source=\"linkEnd\">\n" +
    "            <details key=\"linkEnd\" value=\"Empty\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"labeled\">\n" +
    "            <details key=\"labeled\" value=\"false\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"dashed\">\n" +
    "            <details key=\"dashed\" value=\"true\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Formal\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Relationship\">\n" +
    "        <eAnnotations source=\"linkEnd\">\n" +
    "            <details key=\"linkEnd\" value=\"Empty\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"labeled\">\n" +
    "            <details key=\"labeled\" value=\"true\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"dashed\">\n" +
    "            <details key=\"dashed\" value=\"false\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Material\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Relationship\">\n" +
    "        <eAnnotations source=\"linkEnd\">\n" +
    "            <details key=\"linkEnd\" value=\"Empty\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"labeled\">\n" +
    "            <details key=\"labeled\" value=\"true\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"dashed\">\n" +
    "            <details key=\"dashed\" value=\"false\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Mediation\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Relationship\">\n" +
    "        <eAnnotations source=\"linkEnd\">\n" +
    "            <details key=\"linkEnd\" value=\"Empty\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"labeled\">\n" +
    "            <details key=\"labeled\" value=\"true\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"dashed\">\n" +
    "            <details key=\"dashed\" value=\"false\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"http://www.eclipse.org/ocl/examples/OCL\">\n" +
    "            <details key=\"constraint\" value=\"self.getSourceNode().getStereotype() = &quot;Relator&quot; or self.getTargetNode().getStereotype() = &quot;Relator&quot;\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Member\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Relationship\">\n" +
    "        <eAnnotations source=\"linkEnd\">\n" +
    "            <details key=\"linkEnd\" value=\"FilledMDiamond\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"labeled\">\n" +
    "            <details key=\"labeled\" value=\"true\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"dashed\">\n" +
    "            <details key=\"dashed\" value=\"false\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"SubCollection\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Relationship\">\n" +
    "        <eAnnotations source=\"linkEnd\">\n" +
    "            <details key=\"linkEnd\" value=\"FilledCDiamond\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"labeled\">\n" +
    "            <details key=\"labeled\" value=\"true\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"dashed\">\n" +
    "            <details key=\"dashed\" value=\"false\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"SubQuantity\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Relationship\">\n" +
    "        <eAnnotations source=\"linkEnd\">\n" +
    "            <details key=\"linkEnd\" value=\"FilledQDiamond\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"labeled\">\n" +
    "            <details key=\"labeled\" value=\"true\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"dashed\">\n" +
    "            <details key=\"dashed\" value=\"false\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Generalization\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Relationship\">\n" +
    "        <eAnnotations source=\"linkEnd\">\n" +
    "            <details key=\"linkEnd\" value=\"UnfilledArrow\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"labeled\">\n" +
    "            <details key=\"labeled\" value=\"false\"/>\n" +
    "        </eAnnotations>\n" +
    "        <eAnnotations source=\"dashed\">\n" +
    "            <details key=\"dashed\" value=\"false\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"String\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//AttributeType\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Long\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//AttributeType\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Integer\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//AttributeType\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Boolean\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//AttributeType\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"None\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Cardinality\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"*\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Cardinality\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"0\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Cardinality\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"0..*\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Cardinality\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"0..1\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Cardinality\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"1\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Cardinality\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"1..\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Cardinality\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"1..*\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Cardinality\"/>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"Čeština\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Language\">\n" +
    "        <eAnnotations source=\"code\">\n" +
    "            <details key=\"code\" value=\"cs\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "    <eClassifiers xsi:type=\"ecore:EClass\" name=\"English\" abstract=\"false\" interface=\"false\" eSuperTypes=\"//Language\">\n" +
    "        <eAnnotations source=\"code\">\n" +
    "            <details key=\"code\" value=\"en\"/>\n" +
    "        </eAnnotations>\n" +
    "    </eClassifiers>\n" +
    "</ecore:EPackage>\n";