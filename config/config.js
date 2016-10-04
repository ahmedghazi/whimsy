var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'whimsy'
    },
    port: 3001,
    db: 'mongodb://localhost/whimsy-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'whimsy'
    },
    port: 3001,
    db: 'mongodb://localhost/whimsy-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'whimsy'
    },
    port: 3001,
    db: 'mongodb://localhost/whimsy-production'
  }
};

module.exports = config[env];
