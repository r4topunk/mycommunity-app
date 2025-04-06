import { API_BASE_URL } from '~/lib/constants';
import { useEffect, useState } from 'react';

export function useComments(parentAuthor: string, parentPermlink: string) {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    const fetchComments = () => {
      if (!parentAuthor || !parentPermlink) return;
  
      setLoading(true);
      fetch(`${API_BASE_URL}/comments?pa=${parentAuthor}&pp=${parentPermlink}`)
        .then(res => res.json())
        .then(json => {
          if (json.success) setComments(json.data);
          else setError(json.error || 'Unknown error');
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    };
  
    useEffect(() => {
      fetchComments();
      const interval = setInterval(fetchComments, 15000); // ⏱️ every 5s
      return () => clearInterval(interval); // cleanup on unmount
    }, [parentAuthor, parentPermlink]);
  
    return { comments, loading, error, refetch: fetchComments };
  }
  