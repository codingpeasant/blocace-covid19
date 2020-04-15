/* eslint-disable no-loop-func */
const Blocace = require('blocace')
const fs = require('fs')

// initializing the root admin account
// Pass the private key to setup.js with the Blocase server admin key:
// ####################
// PRIVATE KEY: b9fd4594474e95cbcd1501ee9197b418e93c5b03bf578b1501b05c57f360fcc4
// WARNING: THIS PRIVATE KEY ONLY SHOWS ONCE. PLEASE SAVE IT NOW AND KEEP IT SAFE. YOU ARE THE ONLY PERSON THAT IS SUPPOSED TO OWN THIS KEY IN THE WORLD.
// ####################

if (!process.argv[2]) {
  console.error('Missing root private key')
  console.log('Usage: node setup.js <root_private_key>')
  process.exit(1)
}

const covid19MappingPaylod = {
  'collection': 'covid19',
  'fields': {
    'country': { 'type': 'text' },
    'date': { 'type': 'datetime' },
    'confirmed': { 'type': 'number' },
    'death': { 'type': 'number' },
    'recovered': { 'type': 'number' }
  }
}

const permission = {
  'collectionsWrite': ['default', 'covid19'],
  'collectionsReadOverride': ['covid19']
}

const permissionWeb = {
  'collectionsReadOverride': ['covid19']
}

const accounts = {
  'US': {
    'dateOfBirth': '1987-12-12',
    'firstName': 'Hooper',
    'lastName': 'Vincent',
    'organization': 'Department of Health & Human Services',
    'position': 'Data Entry',
    'email': 'hoopervincent@hhs.gov',
    'phone': '+1 (849) 503-2756',
    'address': '699 Canton Court, Mulino, South Dakota, 9647'
  },
  'Canada': {
    'dateOfBirth': '1977-10-10',
    'firstName': 'Bond',
    'lastName': 'Burton',
    'organization': 'Health Canada',
    'position': 'Data Entry',
    'email': 'bondburton@gc.ca',
    'phone': '+1 (990) 493-3876',
    'address': '459 Bragg Street, Kent, Kentucky, 2398'
  },
  'Spain': {
    'dateOfBirth': '1990-11-11',
    'firstName': 'Mosley',
    'lastName': 'Macias',
    'organization': 'Ministerio de Sanidad, Consumo y Bienestar Social',
    'position': 'Data Entry',
    'email': 'MosleyMacias@gob.es',
    'phone': '+1 (812) 462-2068',
    'address': '612 Barwell Terrace, Bartonsville, District Of Columbia, 6791'
  },
  'Italy': {
    'dateOfBirth': '1986-09-11',
    'firstName': 'Hartman',
    'lastName': 'Davidson',
    'organization': 'Ministero della Salute',
    'position': 'Data Entry',
    'email': 'HartmanDavidson@gov.it',
    'phone': '+1 (188) 575-5611',
    'address': '545 Hinckley Place, Worcester, Mississippi, 6445'
  },
  'France': {
    'dateOfBirth': '1979-07-19',
    'firstName': 'Parrish',
    'lastName': 'Simpson',
    'organization': 'Ministère des Solidarités et de la Santé',
    'position': 'Data Entry',
    'email': 'HartmanDavidson@gov.fr',
    'phone': '+1 (816) 544-2137',
    'address': '180 Virginia Place, Eagletown, Virgin Islands, 7466'
  },
  'Germany': {
    'dateOfBirth': '1998-09-21',
    'firstName': 'Elisabeth',
    'lastName': 'Schwarzhaupt',
    'organization': 'Bundesministerium für Gesundheit',
    'position': 'Data Entry',
    'email': 'HartmanDavidson@gov.de',
    'phone': '+1 (816) 544-2137',
    'address': '424 Vandervoort Place, Biddle, Texas, 2968'
  },
  'United Kingdom': {
    'dateOfBirth': '1978-01-25',
    'firstName': 'Felicia',
    'lastName': 'Garza',
    'organization': 'Department of Health and Social Care',
    'position': 'Data Entry',
    'email': 'HartmanDavidson@gov.uk',
    'phone': '+1 (777) 511-8452',
    'address': '627 Interborough Parkway, Alden, Maryland, 3828'
  },
  'China': {
    'dateOfBirth': '1996-05-21',
    'firstName': 'Wilkinson',
    'lastName': 'Lynch',
    'organization': 'National Health Commission',
    'position': 'Data Entry',
    'email': 'WilkinsonLynch@gov.cn',
    'phone': '+1 (828) 473-3700',
    'address': '908 Grant Avenue, Tonopah, Iowa, 4664'
  },
  'Web': {
    'dateOfBirth': '2020-05-21',
    'firstName': 'Web',
    'lastName': 'Web',
    'organization': 'Earth',
    'position': 'Data Reader',
    'email': 'web@web.com',
    'phone': '+1 (132) 123-3445',
    'address': '123 Happy Way'
  }
}

// admin account
const blocace = Blocace.createFromPrivateKey(process.argv[2])
// web dapp account
const blocaseWeb = Blocace.createFromPrivateKey('ea31e1e760b5b015e0c495481d4f8b0affa2df8f92a629db9f2cd1b39571364c')

async function start() {
  try {
    // get JWT
    const jwt = await blocace.getJWT()
    console.log('JWT (admin): ' + jwt + '\n')

    // register the web user account
    let webAccountPayload = accounts['Web']
    webAccountPayload.publicKey = blocaseWeb.getPublicKey()
    await Blocace.createAccount(webAccountPayload, 'http', 'localhost', '6899')

    const jwtWeb = await blocaseWeb.getJWT()
    console.log('JWT (web): ' + jwtWeb + '\n')

    // create collection
    const collectionCreationRes = await blocace.createCollection(covid19MappingPaylod)
    console.log('New collection info: ' + JSON.stringify(collectionCreationRes) + '\n')

    // set the web user account read permission
    await blocace.setAccountReadWrite(permissionWeb, blocaseWeb.wallet.address)

    let rawdata = fs.readFileSync('./timeseries.json')
    let covid19CasesByCountry = JSON.parse(rawdata)

    for (var country in covid19CasesByCountry) {
      if (covid19CasesByCountry.hasOwnProperty(country) && accounts[country] != null) {
        console.log(`\nSetting up account for ${country}...`)

        // user account
        const countryClient = Blocace.create('http', 'localhost', '6899')
        // register a new country user account
        let countryAccountPayload = accounts[country]
        countryAccountPayload.publicKey = countryClient.getPublicKey()
        const countryAccountRes = await Blocace.createAccount(countryAccountPayload, 'http', 'localhost', '6899')
        console.log('Address of account: ' + countryAccountRes.data.address)
        console.log('Priv of account: ' + countryClient.wallet.privateKey)

        // set the new account read / write permission
        await blocace.setAccountReadWrite(permission, countryAccountRes.data.address)

        // get JWT for the user account
        await countryClient.getJWT()

        console.log(`Loading transactions to Blocace for ${country}...\n`)

        covid19CasesByCountry[country].forEach(async (doc) => {
          doc.country = country
          try {
            await countryClient.signAndPutDocument(doc, 'covid19')
          } catch (error) {
            console.error(error.response)
          }
        })
      }
    }
  } catch (err) {
    console.error(err.response)
  }
}

start()