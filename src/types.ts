export type PluginMessageEvent =
  | { type: "themechange"; theme: string }
  | { type: "ready" }
  | {
      type: "selectionchange";
      selection?: {
        name: string;
        width: number;
        height: number;
        type: string;
        imageUrl: string;
      };
    };
// Add more message types here
