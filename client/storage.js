const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('codecastbucket103100');
module.exports = bucket;
const bucket = require('./storage');
const uploadFile = async (filePath) => {
  await bucket.upload(filePath, {
    destination: 'uploads/filename.ext',
  });
  console.log(`${filePath} uploaded to ${bucket.name}.`);
};
