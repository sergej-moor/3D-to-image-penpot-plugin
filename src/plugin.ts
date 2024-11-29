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

  const selection = penpot.selection[0];

  // Debug logs
  console.log("Selection object:", selection);
  console.log("Selection properties:", Object.keys(selection));
  console.log("Selection export method:", selection.export);
  console.log("Selection prototype:", Object.getPrototypeOf(selection));

  penpot.ui.sendMessage({
    type: "selectionchange",
    selection: {
      name: selection.name,
      width: selection.width,
      height: selection.height,
      type: selection.type,
      id: selection.id,
    },
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
  width: 464,
  height: 500,
});

// Handle messages from UI
penpot.ui.onMessage(async (message: { type: string }) => {
  if (message.type === "ready") {
    sendSelection();
  } else if (message.type === "export-selection") {
    const selection = penpot.selection[0];
    if (selection) {
      try {
        const imageData = await selection.export({
          type: "png",
          scale: 2,
        });

        // Send the raw Uint8Array data
        penpot.ui.sendMessage({
          type: "export-result",
          imageData: Array.from(imageData), // Convert to regular array for serialization
          width: selection.width,
          height: selection.height,
        });
      } catch (error) {
        console.error("Error exporting shape:", error);
      }
    }
  }
});

// Listen for theme changes
penpot.on("themechange", (theme) => {
  penpot.ui.sendMessage({
    type: "themechange",
    theme: theme,
  });
});
