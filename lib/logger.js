var winston        = require('winston');

var logger = new winston.Logger({
  transports:[
    new winston.transports.Console({
      level: 'verbose',
      handleExceptions: false,
      colorize: true
    })
  ],
  colors:{
    //info: 'blue'
  }
});

module.exports = logger;
