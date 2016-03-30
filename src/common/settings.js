'use strict';

const fs = require('fs');
const settingsVersion = 1;

var merge = function(base, target) {
  var merged = base;
  if (!target) {
    target = {};
  }
  for (var prop in target) {
    merged[prop] = target[prop];
  }
  return merged;
};

var loadDefault = function(version) {
  if (version == null) {
    version = settingsVersion
  }
  switch (version) {
    case 1:
      return {
        teams: [
          {name: 'Mozilla Foundation', url: 'https://chat.mozillafoundation.org'}
        ],
        hideMenuBar: false,
        version: 1
      };
  }
}

var upgradeV0toV1 = function(config_v0) {
  var config = loadDefault(1);
  config.teams.push({
    name: 'Primary team',
    url: config_v0.url
  });
  return config;
};

var upgrade = function(config) {
  var config_version = config.version ? config.version : 0;
  switch (config_version) {
    case 0:
      return upgrade(upgradeV0toV1(config));
    default:
      return config;
  }
};

module.exports = {
  version: settingsVersion,

  upgrade: upgrade,

  readFileSync: function(configFile) {
    var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    if (config.version === settingsVersion) {
      var default_config = this.loadDefault();
      config = merge(default_config, config);
    }
    return config;
  },

  writeFileSync: function(configFile, config) {
    if (config.version != settingsVersion) {
      throw 'version ' + config.version + ' is not equal to ' + settingsVersion;
    }
    var data = JSON.stringify(config, null, '  ');
    fs.writeFileSync(configFile, data, 'utf8');
  },

  loadDefault: loadDefault
};
