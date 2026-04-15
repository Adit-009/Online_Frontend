import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Global component to capture 'ref' from URL and persist it in sessionStorage.
 * This ensures the referral code is kept even if the user navigates between pages.
 */
const ReferralTracker = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      console.log('Referral tracked and persisted:', ref);
      sessionStorage.setItem('pendingReferral', ref);
    }
  }, [searchParams]);

  return null;
};

export default ReferralTracker;
