const Promise = require('bluebird')
const inquirer = require('inquirer')
const { getSheetData, getSheetName } = require('./api/sheet.js')
const migration = require('./migration/migration.js')
const question = require('./question/question.js')

const start = async () => {
  const sheetName = await getSheetName()
  const answer = await inquirer.prompt(question(sheetName))
  const { table, stage } = answer
  const sheet = await Promise.map(table, async (sheet) => {
    const result = {}
    result[sheet] = await getSheetData(sheet)
    console.log(`Receive sheet ${sheet} from firebase`)
    return result
  }, { concurrency: 1 })
  return await Promise.map(stage, async st => {
      console.log(`\nOn stage.. ${st}\n`)
      await migration(st, sheet)
  }, { concurrency: 1 } )
}

start().then(() => console.log('Complete.')).catch(e => console.log(`Error: ${e.message}`))