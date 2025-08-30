import multer from 'multer';

var storage = multer.memoryStorage();

var uploads = multer ({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
})

export default uploads