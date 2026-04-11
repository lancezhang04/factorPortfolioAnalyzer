import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configApi } from '../services/api';
import { useConfigStore } from '../store/configStore';
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

export const useTargetProportions = () => {
  return useQuery({
    queryKey: ['targetProportions'],
    queryFn: () => {
      const useCache = useConfigStore.getState().useCache;
      return configApi.getTargetProportions(useCache);
    },
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

export const useUpdateRegionalSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (split: Record<Region, number>) =>
      configApi.updateRegionalSplit(split),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targetProportions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['factorAnalysis'] });
    },
  });
};

export const useResetRegionalSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => configApi.resetRegionalSplit(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targetProportions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
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
