/**
 * Single source of truth for empty-state copy.
 * Keyed by EmptyStateReason — consumed by the EmptyState component.
 * No card-specific copy logic lives here; cards can append context via children slot.
 */

import type { EmptyStateReason } from "@/types/domain";

export interface EmptyStateMessage {
  title: string;
  description: string;
}

export const EMPTY_STATE_MESSAGES: Record<EmptyStateReason, EmptyStateMessage> = {
  newly_chartered: {
    title: "Limited history",
    description:
      "This institution was chartered recently. Not enough quarterly data is available yet.",
  },
  merged: {
    title: "Institution merged",
    description:
      "This institution's charter has been absorbed into another bank.",
  },
  in_receivership: {
    title: "Institution in receivership",
    description:
      "This institution has been placed in FDIC receivership.",
  },
  data_not_reported: {
    title: "Data not reported",
    description:
      "This metric was not reported in the most recent FDIC filing.",
  },
  insufficient_history: {
    title: "Insufficient history",
    description:
      "Not enough quarters of data are available to show a meaningful trend.",
  },
  api_error: {
    title: "Data unavailable",
    description:
      "We couldn't load this data from the FDIC. You can try again.",
  },
  not_queryable: {
    title: "Not available in FDIC public data",
    description:
      "This metric isn't published in the FDIC public dataset. You can find it in the institution's full Call Report on the FDIC website.",
  },
};
