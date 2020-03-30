import * as core from '@actions/core'
import * as github from '@actions/github'
const sodium = require('tweetsodium')

const run = async (): Promise<void> => {
  try {
    const token = process.env['SETSECRET_USER_TOKEN'] || process.env['GITHUB_TOKEN']
    if (!token) return

    // Create the octokit client
    const octokit: github.GitHub = new github.GitHub(token)
    const nwo = process.env['GITHUB_REPOSITORY'] || '/'
    const [owner, repo] = nwo.split('/')

    // Get your public key, necessary for accessing the secrets endpoints
    const getPublicKeyResponse = await octokit.actions.getPublicKey({
        owner,
        repo,
    })
    const publicKey = getPublicKeyResponse.data.key
    console.log(`PublicKey: ${publicKey}`)

    // Get the keys and values to work on
    let data: Params[] = JSON.parse(core.getInput('data'));

    data.forEach(async entry => {
      console.log(`Saving Secret name ${entry.name}`);
      // Convert the message and key to Uint8Array's (Buffer implements that interface)
      const encrypted = encryptValue(entry.value, publicKey)

      // Create or update a secret for the repository
      // https://octokit.github.io/rest.js/v17#actions-create-or-update-secret-for-repo
      await octokit.actions.createOrUpdateSecretForRepo({
        owner,
        repo,
        name: 'HelloWorld',
        encrypted_value: encrypted,
        key_id: getPublicKeyResponse.data.key_id
      })
      console.log(`Saved ${entry.name} in Secrets`)
    });

  } catch (error) {
    console.error(error.message)
    core.setFailed(`SetSecret-action failure: ${error}`)
  }
}

run()

interface Params {
  name: string;
  value: string;
}

export default run

function encryptValue(value: string, publicKey: string) {
  const messageBytes = Buffer.from(value)
  const keyBytes = Buffer.from(publicKey, 'base64')
  // Encrypt using LibSodium.
  const encryptedBytes = sodium.seal(messageBytes, keyBytes)
  // Base64 the encrypted secret
  const encrypted = Buffer.from(encryptedBytes).toString('base64')
  console.log(`Encrypted value (Base64 encoded): ${encrypted}`)
  return encrypted
}
