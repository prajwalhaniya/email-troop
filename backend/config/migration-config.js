const config = require('./config.json');

module.exports = {
  'development': config['development'].mysql,
  'production': config['production'].mysql
};
