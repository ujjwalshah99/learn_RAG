import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { Queue } from 'bullmq';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const app = express();
app.use(cors());
const upload = multer({ storage: storage })

const queue = new Queue('RAG-pdf', {
    connection: {
        host: 'localhost',
        port: 6380,
    },
});

app.get("/" , (req , res) => {
    res.send("Hi")
})

app.post("/upload/pdf" , upload.single('pdf') , async (req,res) => {
    await queue.add('file-ready' , JSON.stringify({ 
        filename: req.file.originalname,
        source : req.file.destination,
        path : req.file.path
    })
)
    return res.json({message : 'uploaded'});
})

app.listen(8000 , ()=> {
    console.log("App is list 8000")
})

