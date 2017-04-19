import * as actions from '../types';

export function showAll(){
    return {
        type: actions.SET_GOAL_FILTER,
        filter: actions.VisibilityFilters.ALL
    };
}
export function showCompleted(){
    return {
        type: actions.SET_GOAL_FILTER,
        filter: actions.VisibilityFilters.COMPLETED
    };
}
export function showActive(){
    return {
        type: actions.SET_GOAL_FILTER,
        filter: actions.VisibilityFilters.ACTIVE
    };
}
