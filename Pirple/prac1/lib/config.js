const environments = {
  staging: {
    httpPort: 3000,
    httpsPort: 3001,
    hashingSecret: 'clark'
  },
  
  production: {
    httpPort: 5000,
    httpsPort: 5001,
    hashingSecret: 'kent'
  },
};

const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ?
  process.env.NODE_ENV :
  '';

const environmentToExport = typeof(environments[currentEnvironment]) === 'undefined' ?
  environments.staging :
  environments[currentEnvironment];

module.exports = environmentToExport;
