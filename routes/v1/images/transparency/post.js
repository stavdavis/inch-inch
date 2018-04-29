const fs = require('fs');
const promisify = require('es6-promisify');
const when = require('when');
const cp = require('child_process');

const s3 = require('../../../../lib/s3');

const write = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const exec = promisify(cp.exec);

function createTransparentImage(req, res) {
  var name = req.body.name,
    baseline = req.body.baseline,
    composite = req.body.composite,
    template = req.body.template,
    bfile = `${name}-baseline.png`,
    cfile = `${name}-composite.png`,
    tfile = `${name}.png`,
    key = `quotes/${template}/transparent/${name}-${template}-ts.png`;

  when.all([
    write(bfile, baseline, 'base64'),
    write(cfile, composite, 'base64')
  ]).then(() => {
    var command = `convert ${bfile} ${cfile} -alpha off \\( -clone 0,1 -compose difference -composite -negate \\) ` +
      `\\( -clone 0,2 +swap -compose divide -composite \\) -delete 0,1 +swap -compose Copy_Opacity -composite ${tfile}`;
    return exec(command);
  }).then(() => {
    return s3.upload(tfile, 'quoteartquotes', key);
  }).then(() => {
    return when.all([
      unlink(bfile),
      unlink(cfile),
      unlink(tfile)
    ]);
  }).then(() => {
    res.send({success: 'success'});
  }).catch((err) => {
    res.send({err});
  });
}

module.exports = function(app) {
  app.post('/v1/images/transparency', createTransparentImage);
};
