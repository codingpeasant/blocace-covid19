import { combineReducers } from 'redux';
import covid19Reducer from './covid19Reducer';
import accountReducer from './accountReducer';

export default combineReducers ({
	covid19: covid19Reducer,
	accounts: accountReducer
});