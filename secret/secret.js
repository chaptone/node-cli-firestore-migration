const getFirebaseSecret = (state) => {
  const { env } = process
  return {
    type: env[`${state}_type`],
    project_id: env[`${state}_project_id`],
    private_key_id: env[`${state}_private_key_id`],
    private_key: env[`${state}_private_key`],
    client_email: env[`${state}_client_email`],
    client_id: env[`${state}_client_id`],
    auth_uri: env[`${state}_auth_uri`],
    token_uri: env[`${state}_token_uri`],
    auth_provider_x509_cert_url: env[`${state}_auth_provider_x509_cert_url`],
    client_x509_cert_url: env[`${state}_client_x509_cert_url`],
  }
}

const getSheetSecret = (state = 'sheet') => {
  const { env } = process
  return {
    type: env[`${state}_type`],
    project_id: env[`${state}_project_id`],
    private_key_id: env[`${state}_private_key_id`],
    private_key: env[`${state}_private_key`],
    client_email: env[`${state}_client_email`],
    client_id: env[`${state}_client_id`],
    auth_uri: env[`${state}_auth_uri`],
    token_uri: env[`${state}_token_uri`],
    auth_provider_x509_cert_url: env[`${state}_auth_provider_x509_cert_url`],
    client_x509_cert_url: env[`${state}_client_x509_cert_url`],
    spreadsheet_id: env.spreadsheet_id
  }
}

const getApiKey = () => {
  const { env } = process
  return env.key
}

module.exports = {
  getFirebaseSecret,
  getSheetSecret,
  getApiKey
}