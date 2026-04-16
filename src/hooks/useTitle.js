import { useEffect } from 'react';

const useTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | Third Eye Computer Education` : 'Third Eye Computer Education';
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};

export default useTitle;
