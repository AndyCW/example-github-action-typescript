import * as core from '@actions/core'
import * as github from '@actions/github'
//import * as sodium from 'tweetsodium'

const run = async (): Promise<void> => {
  try {
    const token = process.env['GITHUB_TOKEN']
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
    console.log(`PublicKey: ${getPublicKeyResponse.data.key}`)

/*     // Encrypt the value
    const value = core.getInput('thanks-message');
    // Convert the message and key to Uint8Array's (Buffer implements that interface)
    const messageBytes = Buffer.from(value);
    const keyBytes = Buffer.from(getPublicKeyResponse.data.key, 'base64');
    // Encrypt using LibSodium.
    const encryptedBytes = sodium.seal(messageBytes, keyBytes);
    // Base64 the encrypted secret
    const encrypted = Buffer.from(encryptedBytes).toString('base64');
    console.log(`Encrypted value (Base64 encoded): ${encrypted}`);

    // Create or update a secret for the repository
    // https://octokit.github.io/rest.js/v17#actions-create-or-update-secret-for-repo
     const issueCommentResponse = await octokit.actions.createOrUpdateSecretForRepo({
      owner,
      repo,
      name: 'HelloWorld',
      encrypted_value: encrypted,
    })
    console.log(`Replied with thanks message: ${issueCommentResponse.data.url}`) */
  } catch (error) {
    console.error(error.message)
    core.setFailed(`SetSecret-action failure: ${error}`)
  }
}

run()

export default run