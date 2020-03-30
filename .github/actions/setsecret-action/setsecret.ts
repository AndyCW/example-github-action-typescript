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
    let data: params = JSON.parse(core.getInput('data'));

    data.secrets.forEach(async secret => {
      console.log(`Saving Secret name ${secret.name}`);
      // Convert the message and key to Uint8Array's (Buffer implements that interface)
      const encrypted = encryptValue(secret.value, publicKey)

      // Create or update a secret for the repository
      // https://octokit.github.io/rest.js/v17#actions-create-or-update-secret-for-repo
      await octokit.actions.createOrUpdateSecretForRepo({
        owner,
        repo,
        name: 'HelloWorld',
        encrypted_value: encrypted,
        key_id: getPublicKeyResponse.data.key_id
      })
      console.log(`Saved ${secret.name} in Secrets`)
    });

  } catch (error) {
    console.error(error.message)
    core.setFailed(`SetSecret-action failure: ${error}`)
  }
}

run()

interface secretItem {
  name: string;
  value: string;
}

interface params {
  secrets: secretItem[]
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
