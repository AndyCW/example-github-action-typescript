import * as core from '@actions/core'

const run = async (): Promise<void> => {
  try {
    const variable = core.getInput('variable-name')
    core.setSecret(variable)
  } catch (error) {
    core.setFailed(`maskvariable-action failure: ${error}`)
  }
}

run()

export default run