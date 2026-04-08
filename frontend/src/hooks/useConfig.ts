import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configApi } from '../services/api';
import { FactorPremiums, EquityConfig } from '../types/config';
import { Region } from '../types/portfolio';

export const useConfig = () => {
  return useQuery({
    queryKey: ['config'],
    queryFn: () => configApi.getConfig(),
    staleTime: Infinity, // Config rarely changes, keep it cached
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useTargetProportions = (useCache = false) => {
  return useQuery({
    queryKey: ['targetProportions', useCache],
    queryFn: () => configApi.getTargetProportions(useCache),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useUpdateFactorPremiums = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (factorPremiums: FactorPremiums) =>
      configApi.updateFactorPremiums(factorPremiums),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      queryClient.invalidateQueries({ queryKey: ['factorAnalysis'] });
    },
  });
};

export const useUpdateEquityConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticker, config }: { ticker: string; config: EquityConfig }) =>
      configApi.updateEquityConfig(ticker, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['targetProportions'] });
      queryClient.invalidateQueries({ queryKey: ['factorAnalysis'] });
    },
  });
};

export const useUpdateTargetValueLoadings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loadings: Record<Region, number>) =>
      configApi.updateTargetValueLoadings(loadings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['targetProportions'] });
      queryClient.invalidateQueries({ queryKey: ['factorAnalysis'] });
    },
  });
};
