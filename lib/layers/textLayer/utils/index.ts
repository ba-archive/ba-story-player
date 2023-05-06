import { Text } from "@/types/common";

export * from "./typingEmitter";

export function parseTextEffectToCss(text: Text): Partial<CSSStyleDeclaration> {
  return {
    fontSize: "99",
  };
}
