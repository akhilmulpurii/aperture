import { useEffect, useState } from "react";
import {
  CountryInfo,
  CultureDto,
} from "@jellyfin/sdk/lib/generated-client/models";
import { fetchCountries, fetchCultures } from "@/src/actions/utils";

interface UseLibraryLookupsOptions {
  setLoading: (loading: boolean) => void;
}

export function useLibraryLookups({ setLoading }: UseLibraryLookupsOptions) {
  const [cultures, setCultures] = useState<CultureDto[]>([]);
  const [countries, setCountries] = useState<CountryInfo[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [culturesData, countriesData] = await Promise.all([
          fetchCultures(),
          fetchCountries(),
        ]);
        setCultures(culturesData);
        setCountries(countriesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setLoading]);

  return { cultures, countries };
}
