const environments = {
  staging: {
    httpPort: 3000,
    httpsPort: 3001,
    name: 'staging',
    hashingSecret: 'thisIsSecret',
    maxChecks: 5,
    twilio: {
      'accountSid' : 'AC7d347b7c77f0e844787dae08f1ae0124',
      'authToken' : '6a181f2e21e51c940c9e055a4188e3ec',
      'fromPhone' : '+12056977135'
    }
  },
  production: {
    httpPort: 5000,
    httpsPort: 5001,
    name: 'production' ,
    hashingSecret: 'thisAlsoIsSecret',
    maxChecks: 5,
    twilio: {
      'accountSid' : 'AC7d347b7c77f0e844787dae08f1ae0124',
      'authToken' : '6a181f2e21e51c940c9e055a4188e3ec',
      'fromPhone' : '+12056977135'
    }
  }
}


const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

const conf = typeof(environments[currentEnvironment]) === 'undefined' ? environments.staging : environments[currentEnvironment];

module.exports = conf;