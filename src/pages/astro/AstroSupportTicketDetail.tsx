import SupportTicketDetailPage from '../support/SupportTicketDetailPage';
import { astroSupportAPI } from '../../services/api/support';

export default function AstroSupportTicketDetail() {
  return (
    <SupportTicketDetailPage
      config={{
        variant: 'astro',
        api: astroSupportAPI,
        listPath: '/astro/support',
        partnerLabel: 'Astrologer',
      }}
    />
  );
}
