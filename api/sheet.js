const { google } = require('googleapis')
const { getSheetSecret, getApiKey } = require('../secret/secret.js')

function getJwt() {
  const credentials = getSheetSecret()
  return new google.auth.JWT(
    credentials.client_email, null, credentials.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
}

function convert(data) {
  const keys = data[0]
  const values = data.slice(1)
  return values.map(array => {
    let object = {}
    keys.forEach((key, i) => object[key] = array[i])
    return object
  })
}

const getSheetName = async () => {
  const { spreadsheet_id } = getSheetSecret()
  const jwt = getJwt()
  const apiKey = getApiKey()
  const sheets = google.sheets({version: 'v4'})
  const result = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheet_id,
    auth: jwt,
    key: apiKey,
  })
  return result.data.sheets.map(s => s.properties.title)
}

const getSheetData = async (range) => {
  const { spreadsheet_id } = getSheetSecret()
  const jwt = getJwt()
  const apiKey = getApiKey()
  const sheets = google.sheets({version: 'v4'})
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheet_id,
    range: range,
    auth: jwt,
    key: apiKey,
  })
  return convert(result.data.values)
}

module.exports = { getSheetData, getSheetName }