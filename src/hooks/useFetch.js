import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

export function useFetch(url, defaultValue) {
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(true);
  const defaultRef = useRef(defaultValue);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(url)
      .then((res) => active && setData(res.data))
      .catch(() => active && setData(defaultRef.current))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [url]);

  return { data, loading, setData };
}

export function useFetchWithHeaders(url, defaultValue, headers) {
  const [data, setData] = useState(defaultValue);
  const defaultRef = useRef(defaultValue);

  useEffect(() => {
    api
      .get(url, { headers })
      .then((res) => setData(res.data))
      .catch(() => setData(defaultRef.current));
  }, [url, headers]);

  return { data, setData };
}

