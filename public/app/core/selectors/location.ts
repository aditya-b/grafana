import { LocationState } from '@grafana/runtime';

export const getRouteParamsId = (state: LocationState) => state.routeParams.id;
export const getRouteParamsPage = (state: LocationState) => state.routeParams.page;
export const getLocation = (state: LocationState) => state;
