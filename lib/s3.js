const s3 = require('s3');
const when = require('when');

const client = s3.createClient({
  s3Options: {
    accessKeyId: 'AKIAIH3CFL3PFYN2JAGQ',
    secretAccessKey: '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'
  }
});

function upload(localFilename, bucket, remoteFilename) {
  return when.promise((resolve, reject) => {
    var uploader = client.uploadFile({
      localFile: localFilename,
      s3Params: {
        Bucket: bucket,
        Key: remoteFilename
      }
    });

    uploader.on('error', reject);
    uploader.on('end', resolve);
  });
}

module.exports = {
  upload
};
