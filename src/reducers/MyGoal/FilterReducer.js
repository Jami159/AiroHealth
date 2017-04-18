'use strict';

import * as actions from '../../actions/types';
var {VisibilityFilters} = actions;

const initialState = {
    visibleGoals: VisibilityFilters.ALL
}

export default (state=initialState, action) => {
    switch(action.type){
        case actions.SET_GOAL_FILTER:
            return action.filter;
        default:
            return state;
    };
};
