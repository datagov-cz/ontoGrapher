export var Shapes: {
	[key: string]: {
		body: string,
		color: string,
	}
} = {
	"https://slovník.gov.cz/základní/pojem/typ-objektu": {body: "bodyBox", color: "#FFFFFF"},
	"https://slovník.gov.cz/základní/pojem/typ-vlastnosti": {body: "bodyEllipse", color: "#FFFFFF"},
	"https://slovník.gov.cz/základní/pojem/typ-vztahu": {body: "bodyDiamond", color: "#FFFFFF"},
	"https://slovník.gov.cz/základní/pojem/typ-události": {body: "bodyTrapezoid", color: "#FFFFFF"},
	default: {body: "bodyBox", color: "#FFFFFF"},
}