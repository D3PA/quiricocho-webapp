const multer = require('multer');
const path = require('path');
const fs = require('fs');

// crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// storage en memoria para archivos pequeños (< 50MB)
const memoryStorage = multer.memoryStorage();

// storage en disco para archivos grandes (>= 50MB)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// middleware inteligente que elige el storage segun el tamaño del archivo
const smartUpload = (req, res, next) => {
  // por defecto usar memoryStorage
  let storage = memoryStorage;
  
  // si el tamaño del archivo es mayor a 50MB, usar diskStorage
  const contentLength = parseInt(req.headers['content-length']);
  if (contentLength && contentLength > 50 * 1024 * 1024) {
    storage = diskStorage;
    console.log(`Usando diskStorage para archivo grande: ${(contentLength / 1024 / 1024).toFixed(2)}MB`);
  }

  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const allowedMimes = [ // tipos de MIME permitidos
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/octet-stream'
      ];
      
      if (allowedMimes.includes(file.mimetype) || 
          file.originalname.match(/\.(csv|xlsx|xls)$/i)) { 
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos CSV o Excel'), false);
      }
    },
    limits: {
      fileSize: 200 * 1024 * 1024, // 200MB maximo permitido
    }
  }).single('file');

  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'Archivo demasiado grande. Maximo 200MB permitido.',
          code: 'FILE_TOO_LARGE'
        });
      }
      return res.status(400).json({
        error: err.message,
        code: 'UPLOAD_ERROR'
      });
    }
    next();
  });
};

// tambien exportar upload normal para otros usos
const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB para memory storage
  }
});

module.exports = { smartUpload, upload };