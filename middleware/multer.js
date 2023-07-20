const multer = require('multer');
const multerSharpResizer = require('multer-sharp-resizer');
const path = require('path');

let Storage = multer.diskStorage({
  destination: './Public/uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
  },
});

let uploads = multer({
  storage: Storage,
  fileFilter: function (req, file, callback) {
    if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg') {
      callback(null, true);
    } else {
      console.log('Only jpg & png files are supported!');
      callback(null, false);
    }
  },
});

// Function to resize/crop the uploaded image
const resizeImage = new multerSharpResizer({
    sizes: [
      {
        prefix: 'small',
        width: 300,
        height: 300,
        option: 'crop',
      },
      {
        prefix: 'medium',
        width: 600,
        height: 600,
        option: 'crop',
      },
      // Add more size configurations as needed
    ],
    destination: './Public/uploads/', // Destination folder for resized images
  });

module.exports = {
  uploads,
  resizeImage,
};
