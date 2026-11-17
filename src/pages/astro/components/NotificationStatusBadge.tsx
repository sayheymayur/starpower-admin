import Badge from '../../../components/ui/badge';
import type { NotificationStatus } from '../../../services/api/astroNotifications';

export default function NotificationStatusBadge({ status }: { status: NotificationStatus | string }) {
  const normalized = status.toLowerCase();
  const color =
    normalized === 'sent'
      ? 'success'
      : normalized === 'scheduled'
        ? 'warning'
        : normalized === 'failed'
          ? 'error'
          : 'dark';
  return (
    <Badge color={color} size="sm">
      {normalized}
    </Badge>
  );
}
