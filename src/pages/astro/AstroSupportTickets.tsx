import SupportTicketsPage from '../support/SupportTicketsPage';
import { astroSupportAPI } from '../../services/api/support';

export default function AstroSupportTickets() {
  return (
    <SupportTicketsPage
      config={{
        variant: 'astro',
        api: astroSupportAPI,
        basePath: '/astro/support',
        partnerLabel: 'Astrologer',
        title: 'Partner Support',
        description: 'Manage Help Center tickets and FAQs from astrologer partners',
      }}
    />
  );
}
