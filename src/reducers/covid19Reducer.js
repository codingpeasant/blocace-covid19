export default (state = [], action) => {
	switch (action.type) {
		case 'FETCH_COVID19':
			return action.payload;
		default:
			return state;
	}
};