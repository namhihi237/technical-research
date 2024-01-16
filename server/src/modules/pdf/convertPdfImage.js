const outputFile = `test_document.jpg`;
const fs = require('fs');
const im = require('imagemagick'); // Make sure to import the 'imagemagick' library if not already done
const path = require('path');
const filePath = path.join(__dirname, "test.pdf");
const imgFilePath = outputFile;

if (!fs.existsSync(filePath)) {
  console.error('PDF file not found!');
  process.exit(1); // Exit the process with an error code
}
const readStream = fs.createReadStream(filePath);
const writeStream = fs.createWriteStream(imgFilePath);
writeStream.on('error', (err) => {
  console.error(err);
});
readStream.pipe(writeStream);

writeStream.on('finish', () => {
  im.convert([
    imgFilePath + '[0]',
    '-background', 'white',
    '-alpha', 'remove',
    '-resize', '500',
    '-;', '100',
    imgFilePath
  ], (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Image conversion successful!');
    }
  });
});
