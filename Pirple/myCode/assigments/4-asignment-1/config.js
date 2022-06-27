const environments = {
  staging: {
    httpPort: 4000,
    httpsPort: 4001,
    name: 'staging'
  },
  
  production: {
    httpPort: 5000,
    httpsPort: 5001,
    name: 'production'
  }
};

const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const environmentToExport = typeof(environments[currentEnvironment]) === 'undefined' ? environments.staging : environments[currentEnvironment];

module.exports = environmentToExport;