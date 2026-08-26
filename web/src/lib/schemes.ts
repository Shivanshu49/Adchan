import payload from "../../../shared/schemes.json";

import type { LocalizedText } from "@/types/failures";


export interface AdjacentScheme {
  readonly id: string;
  readonly name: LocalizedText;
  readonly purpose: LocalizedText;
  readonly documentedEligibility: LocalizedText;
  readonly applyAt: LocalizedText;
  readonly documents: readonly LocalizedText[];
  readonly uncertainty: LocalizedText;
  readonly source: {
    readonly label: string;
    readonly url: string;
  };
}


const schemes = payload.schemes satisfies readonly AdjacentScheme[];

export default schemes;
