import multer from "multer";

export const upload = multer({storage: multer.diskStorage({})}) // for local storage