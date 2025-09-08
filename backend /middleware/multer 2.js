// backend/middleware/multer.js (Updated)
import multer from "multer";
import path from "path";

// ✅ Storage: Temporarily store in /uploads (Cloudinary will upload from here)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save to local /uploads folder temporarily
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
        cb(null, uniqueName);
    },
});

// ✅ Filter for images and audio files
const fileFilter = (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png|webp|gif/;
    const audioTypes = /mp3|wav|flac|aac|ogg|m4a/;
    const videoTypes = /mp4|mov|avi|mkv/; // For demo videos

    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    // Check for images
    const isImage = imageTypes.test(extname) && mimetype.startsWith('image/');

    // Check for audio
    const isAudio = audioTypes.test(extname) && mimetype.startsWith('audio/');

    // Check for video
    const isVideo = videoTypes.test(extname) && mimetype.startsWith('video/');

    if (isImage || isAudio || isVideo) {
        return cb(null, true);
    } else {
        cb(new Error(`Unsupported file type. Allowed: Images (${imageTypes.source}), Audio (${audioTypes.source}), Video (${videoTypes.source})`));
    }
};

// ✅ Different size limits based on file type
const limits = {
    fileSize: (req, file) => {
        if (file.mimetype.startsWith('image/')) {
            return 5 * 1024 * 1024; // 5MB for images
        } else if (file.mimetype.startsWith('audio/')) {
            return 50 * 1024 * 1024; // 50MB for audio
        } else if (file.mimetype.startsWith('video/')) {
            return 100 * 1024 * 1024; // 100MB for videos
        }
        return 5 * 1024 * 1024; // Default 5MB
    },
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // Max 100MB (will be handled by file type)
        files: 20, // Max 20 files per request
    },
});

export default upload;