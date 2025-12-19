import { useState, useEffect } from 'react';

export default function useFetch(fetcher, args = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetcher(...args)
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [JSON.stringify(args)]);

    return { data, loading, error };
}
