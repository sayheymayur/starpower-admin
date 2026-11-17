import SupportTicketDetailPage from './support/SupportTicketDetailPage';
import { listenerSupportAPI } from '../services/api/support';

export default function SupportTicketDetail() {
  return (
    <SupportTicketDetailPage
      config={{
        variant: 'admin',
        api: listenerSupportAPI,
        listPath: '/support-tickets',
        partnerLabel: 'Listener',
      }}
    />
  );
}
