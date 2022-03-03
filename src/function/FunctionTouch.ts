import { updateDiagramPosition, zoomDiagram } from "./FunctionDiagram";
import { AppSettings } from "../config/Variables";
import { paper } from "../main/DiagramCanvas";

let drag: { x: any; y: any } | undefined = undefined;
let pinchZoom: number = 1;

export function initTouchEvents(manager: HammerManager) {
  manager.add(new Hammer.Pinch({ enable: true, threshold: 0 }));
  manager.add(
    new Hammer.Pan({
      enable: (recognizer, event) => event && event.pointerType === "touch",
      threshold: 10,
    })
  );

  manager.on("panstart", (event: HammerInput) => {
    const point = paper.clientToLocalPoint(event.center);
    const scale = paper.scale();
    drag = { x: point.x * scale.sx, y: point.y * scale.sy };
  });

  manager.on("panmove", (event: HammerInput) => {
    if ("offsetX" in event.srcEvent) {
      const pointX = event.srcEvent.offsetX;
      const pointY = event.srcEvent.offsetY;
      if (drag) {
        paper.translate(pointX - drag.x, pointY - drag.y);
      }
    }
  });

  manager.on("panend", () => {
    updateDiagramPosition(AppSettings.selectedDiagram);
    drag = undefined;
  });

  manager.on("pinchstart", () => {
    pinchZoom = 1;
  });

  manager.on("pinchmove", (event: HammerInput) => {
    const point = paper.clientToLocalPoint(event.center);
    if (event.scale - pinchZoom > 0.1) {
      zoomDiagram(point.x, point.y, 1);
      pinchZoom += 0.1;
    } else if (event.scale - pinchZoom > -0.1) {
      zoomDiagram(point.x, point.y, -1);
      pinchZoom -= 0.1;
    }
  });
}
