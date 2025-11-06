import multer from 'multer'

const storage = multer.diskStorage({})
export const uploadSingle = multer({ storage }).single('avatar')
