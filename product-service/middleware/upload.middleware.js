import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:"ecommerce-products",
        allowed_formats: ["jpg", "jpeg","png", "webp"],
    },
});

const upload = multer({
    storage,
    limits:{fileSize: 5 * 1024 * 1024},
    fileFilter:(req, file, cb) =>{
        if(!file.mimetype.startsWith('image/')){
            return cb(new Error("only image file are allowed! "), false);
        }
        cb(null, true);
    }
});

export default upload;