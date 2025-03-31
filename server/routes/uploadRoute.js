import path from "path";
import multer from "multer";

// storage destination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the destination folder based on the file type
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".gif") {
      cb(null, "uploads/images");
    } else if (
      ext === ".mp4" ||
      ext === ".avi" ||
      ext === ".mov" ||
      ext === ".wmv"
    ) {
      cb(null, "uploads/videos");
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// multer
const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 50 * 1024 * 1024,
  // },
});

const uploadMultiple = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "videos", maxCount: 5 },
]);

export { uploadMultiple };
