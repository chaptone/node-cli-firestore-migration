const question = (tables) => {
  return [
    {
      type: 'checkbox',
      name: 'table',
      message: 'Which tables do you want to migrate?',
      choices: tables,
      validate
    },
    {
      type: 'checkbox',
      name: 'stage',
      message: 'Which state do you want to migrate?',
      choices: ['dev', 'uat', 'prod'],
      validate
    },
  ]
}

const validate = async (input) => {
  if (!input.length) {
    return 'Should select some choices.'
  }
  return true
 }

module.exports = question