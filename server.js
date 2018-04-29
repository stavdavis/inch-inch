var express = require('express'),
  app = express(),
  basicAuth = require('basic-auth-connect'),
  bodyParser = require('body-parser'),
  _ = require('lodash');

if (process.env.ENVIRONMENT != 'development') {
  app.use(basicAuth('qu0te', 'm4chine'));
}

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

var baseDir = __dirname + '/public/';
app.use(express.static(baseDir));

app.listen(process.env.PORT || 5000);

_.forEach([
  './routes/v1/images/transparency/post',
  './routes/v1/templates/post',
  './routes/v1/templates/:template_id/put',
  './routes/v1/templates/:template_id/get',
  './routes/v1/templates/get',
  './routes/v1/quotes/get',
  './routes/v1/batch/get',
  './routes/v1/batch/:batch_id/get',
  './routes/v1/batch/post',
  './routes/v1/batch/:batch_id/quotes/:quote_id/post',
  './routes/v1/database/words/post',
  './routes/v1/database/characters/post',
  './routes/v1/database/sentences/post',
  './routes/v1/database/exclamation/post',
  './routes/v1/database/question/post',
  './routes/v1/database/language/post',
  './routes/v1/database/question_answer/post',
  './routes/v1/database/same_first_word/post',
  './routes/v1/database/first_word/post'
], (route) => {
  require(route)(app);
});
