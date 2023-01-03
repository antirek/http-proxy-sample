const mongoose = require('mongoose');
const config = require('config');
mongoose.Promise = Promise;

const LogRequestSchema = new mongoose.Schema({
  requestMethod: String,
  requestUrl: String,
  requestBody: String,
  responseStatus: String,
  responseBody: String,
});

const connection = mongoose.createConnection(config.get('mongodb'));
const LogRequest = connection.model('LogRequest', LogRequestSchema);

module.exports = {LogRequest};
