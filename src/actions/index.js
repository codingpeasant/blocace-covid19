import _ from 'lodash';
import Blocace from 'blocace'

const blocaceWeb = Blocace.createFromPrivateKey('ea31e1e760b5b015e0c495481d4f8b0affa2df8f92a629db9f2cd1b39571364c', 'https', 'www.blocace.com', '16899')

export const fetchCovid19 = () => async dispatch => {
  await blocaceWeb.getJWT();
  const searchResponse = await blocaceWeb.query({
    'size': 350,
    'query': {
      'start': '2020-01-22T00:00:00Z',
      'field': 'date'
    },
    'sort': [
      '-date'
    ]
  }, 'covid19');

  const accountAddresses = _.uniq(_.map(searchResponse.hits, '_address'));
  accountAddresses.forEach(address => dispatch(fetchAccount(address)));

  dispatch({ type: 'FETCH_COVID19', payload: searchResponse.hits });
};

export const fetchAccount = address => async dispatch => {
  const response = await blocaceWeb.getAccount(address)
  response['_address'] = address
  dispatch({ type: 'FETCH_ACCOUNT', payload: response });
};


