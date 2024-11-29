import type { PluginMessageEvent } from "./types";

let shapeChangeListener: ReturnType<typeof penpot.on> | undefined;

async function sendSelection() {
  if (penpot.selection.length <= 0) {
    penpot.ui.sendMessage({
      type: "selectionchange",
      selection: undefined,
    });
    return;
  }

  // Send all selections with position data
  const selections = await Promise.all(
    penpot.selection.map(async (selection) => ({
      name: selection.name,
      width: selection.width,
      height: selection.height,
      type: selection.type,
      id: selection.id,
      x: selection.x,
      y: selection.y,
    }))
  );

  penpot.ui.sendMessage({
    type: "selectionchange",
    selection: selections,
  });
}

// Listen for selection changes
penpot.on("selectionchange", () => {
  if (shapeChangeListener) {
    penpot.off(shapeChangeListener);
  }

  if (penpot.selection.length > 0) {
    shapeChangeListener = penpot.on("shapechange", sendSelection, {
      shapeId: penpot.selection[0].id,
    });
  }

  sendSelection();
});

penpot.ui.open("Selection Viewer", `?theme=${penpot.theme}`, {
  width: 800,
  height: 800,
});

// Handle messages from UI
penpot.ui.onMessage(
  async (message: { type: string; imageData?: Uint8Array }) => {
    if (message.type === "ready") {
      sendSelection();
    } else if (message.type === "export-selection") {
      try {
        // Export all selections
        const exports = await Promise.all(
          penpot.selection.map(async (selection) => {
            const imageData = await selection.export({
              type: "png",
              scale: 4,
            });
            return {
              imageData: Array.from(imageData),
              width: selection.width,
              height: selection.height,
              x: selection.x,
              y: selection.y,
            };
          })
        );

        penpot.ui.sendMessage({
          type: "export-result",
          exports: exports,
        });
      } catch (error) {
        console.error("Error exporting shapes:", error);
      }
    } else if (message.type === "add-capture" && message.imageData) {
      const blockId = penpot.history.undoBlockBegin();
      try {
        // Upload the captured image
        const image = await penpot.uploadMediaData(
          "3d-capture",
          message.imageData,
          "image/png"
        );

        if (image) {
          // Create a rectangle with the image as fill
          const rect = penpot.createRectangle();

          // Position it next to the original selection
          const selection = penpot.selection[0];
          rect.x = selection.x + selection.width + 20;
          rect.y = selection.y;

          // Match the size of the original selection
          rect.resize(selection.width, selection.height);

          // Set the image as fill
          rect.fills = [
            {
              fillOpacity: 1,
              fillImage: image,
            },
          ];

          // Select the new rectangle
          penpot.selection = [rect];
        }
      } catch (error) {
        console.error("Error adding capture to Penpot:", error);
      } finally {
        penpot.history.undoBlockFinish(blockId);
      }
    }
  }
);

// Listen for theme changes
penpot.on("themechange", (theme) => {
  penpot.ui.sendMessage({
    type: "themechange",
    theme: theme,
  });
});
