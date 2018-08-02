var path = require('path');
var ensure = require('file-ensure');
var yaml = require('js-yaml');
var fs = require('fs');
var _ = require('lodash');
var Reconfig = require('reconfig');
var appRoot = require('app-root-path').path;
var appPkgConf = require(appRoot + '/package.json');

var appName = appPkgConf.name.replace(/ /g, '');
var configDir = path.join(appRoot, 'config');
var defaultFiles = (appPkgConf.nmConfig || {}).defaultFiles || ['base', 'dev.example', 'staging', 'live'];
var env = 'dev';

if (!_.isArray(defaultFiles)) {
  console.error('nmConfig Error: nmConfig.defaultFiles MUST be an array. Please check your package.json');
  process.exit();
}

/**
 * Automatically creates the config dir and its needed files
 * The needed file list can be customized adding a
 * nmConfig.defaultFiles property in the project's package.json
 */
function boostrapConfigDir() {
  !fs.existsSync(configDir) && fs.mkdirSync(configDir);

  defaultFiles.forEach(function(fileName) {
    var filePath = path.join(configDir, fileName + '.yml');
    (!fs.existsSync(filePath)) && fs.writeFileSync(filePath, '');
  });
}

/**
 * Leverages on file ensure to ensure the wanted config file
 *
 * @param  {String} fileName
 * @param  {String} env
 */
function ensureFile(fileName, env) {
  var file = path.join(configDir, fileName);
  var from = path.join(configDir, fileName.replace('yml', 'example.yml'));
  var options = {};

  if (fs.existsSync(from)) {
    options.from = from;
  }

  try {
    ensure(file, options);
  } catch(error) {
    if (env === 'dev') {
      throw error;
      return;
    }

    console.error('Cannot ensure file: ' + fileName + '. Error: ', error);
  }
}

/**
 * Parses the list of yaml files in the fongi directory
 * combining then in a final javascript object to use
 * as reconfig config parameter
 *
 * @param  {Array} files
 * @return {Object}
 */
function combineFiles(files) {
  var config = { env: env };

  files.forEach(function(file) {
    var configFilePath = path.join(configDir, file + '.yml');
    var envConfig = yaml.safeLoad(fs.readFileSync(configFilePath, 'utf8'));

    config = _.mergeWith(config, envConfig, function(baseValue, envValue) {
      if (_.isArray(baseValue) && _.isArray(envValue)) {
        return envValue;
      }
    });
  });

  return config;
}

function combinePackageConfig(config, name) {
  return (appPkgConf[name]) ? _.merge(config, appPkgConf[name]) : config;
}

boostrapConfigDir();

/**
 * nmConfig main logic:
 * It will parse all your yml files
 * merge them and return a Reconfig instance
 * for your configuration convenience.
 *
 * Options parameters:
 *
 * baseFiles:   A list of files creating the base configuration
 *              before applying the environment specific config.
 *              These files will be merged in order, the env file
 *              will be the last applied.
 *
 * separator:   The separator Reconfig will use for console vars
 *              overlays.
 *
 * projectName: Defines Your project's name. If none is given, the project's name
 *              will be inferred form your package.json "name" value. All spaces will be removed.
 *
 * prefix:      The prefix that Reconfig will use while grabbing
 *              console variable and applying overlays.
 *              Default value: PROJECTNAME_CONFIG (all uppercase) *
 *
 * ensure:      Tells to nmConfig to check for the existence of <filename>.yml file.
 *              If a <fileName>.example.yml is found, it will be used to produce
 *              the ensured file.
 *
 * env:         Forced value for the environment:
 *              by default nmConfig will read you env form:
 *              - PROJECTNAME_ENV *
 *              - NODE_ENV
 *              - or default to "dev"
 *
 *
 * @param  {Object} options
 * @return {Object}
 */
module.exports = function(options) {
  options = options || {};
  var config = {};
  var files = options.baseFiles || ['base'];
  var reconfigSeparator = options.separator || '_';
  appName = options.projectName || appName;
  var shellVars = {
    env: appName.toUpperCase() + '_ENV',
    reconfigPrefix: appName.toUpperCase() + '_CONFIG'
  };
  var reconfigPrefix = options.prefix || process.env.RECONFIG_PREFIX ||shellVars.reconfigPrefix;
  env = options.env || process.env[shellVars.env]|| process.env.NODE_ENV || 'dev';

  if (!_.isArray(files)) {
    files = [files];
  }

  files.push(env);

  options.ensure && ensureFile(options.ensure, env);

  config = combineFiles(files);
  config = combinePackageConfig(config, appName);
  config.rootDir = config.basedir = appRoot;
  (config.verboseConfig === true) && console.log('----\nnmConfig, loading configuration object:\n %s\n----\nYour environment config prefix is: ' + reconfigPrefix + '\n----\n', JSON.stringify(config, null, 2));  

  return new Reconfig(config, reconfigPrefix, reconfigSeparator);
}
