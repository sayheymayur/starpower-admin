import SupportTicketsPage from './support/SupportTicketsPage';
import { listenerSupportAPI } from '../services/api/support';

export default function SupportTickets() {
  return (
    <SupportTicketsPage
      config={{
        variant: 'admin',
        api: listenerSupportAPI,
        basePath: '/support-tickets',
        partnerLabel: 'Listener',
        title: 'Listener Support',
        description: 'Manage Help Center tickets and FAQs from listener partners',
      }}
    />
  );
}
