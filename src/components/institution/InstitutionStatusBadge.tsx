/**
 * InstitutionStatusBadge — maps InstitutionContext.status to badge variant.
 * active = no badge, merged = warning, in_receivership = danger, inactive = neutral.
 */

import type { InstitutionStatus } from "@/types/domain";
import { Badge } from "@/components/ui/Badge";

interface InstitutionStatusBadgeProps {
  status: InstitutionStatus;
}

export function InstitutionStatusBadge({ status }: InstitutionStatusBadgeProps) {
  switch (status) {
    case "active":
      return null; // No badge for active institutions
    case "merged":
      return (
        <Badge variant="warning" aria-label="This institution has been merged">
          Merged
        </Badge>
      );
    case "in_receivership":
      return (
        <Badge variant="danger" aria-label="This institution is in FDIC receivership">
          In FDIC Receivership
        </Badge>
      );
    case "inactive":
      return (
        <Badge variant="neutral" aria-label="This institution is inactive">
          Inactive
        </Badge>
      );
  }
}
