export default (state = [], action) => {
	switch (action.type) {
		case 'FETCH_ACCOUNT':
			return [...state, action.payload];
		default:
			return state;
	}
};