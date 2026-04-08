import { useQuery } from '@tanstack/react-query';
import { portfolioApi } from '../services/api';
import { useConfigStore } from '../store/configStore';

export const usePortfolio = (useCache = false) => {
  const { setUseCache } = useConfigStore();

  return useQuery({
    queryKey: ['portfolio', useCache],
    queryFn: async () => {
      try {
        return await portfolioApi.getPortfolio(useCache);
      } catch (error) {
        // If fetch fails and we're not using cache, fall back to cache
        if (!useCache) {
          console.warn('Failed to fetch fresh data, falling back to cache');
          setUseCache(true);
          return await portfolioApi.getPortfolio(true);
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch when component mounts if data exists
  });
};

export const useRegionalDistribution = (useCache = false) => {
  return useQuery({
    queryKey: ['regionalDistribution', useCache],
    queryFn: () => portfolioApi.getRegionalDistribution(useCache),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useFactorAnalysis = (useCache = false) => {
  return useQuery({
    queryKey: ['factorAnalysis', useCache],
    queryFn: () => portfolioApi.getFactorAnalysis(useCache),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
