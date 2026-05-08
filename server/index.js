import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { Queue } from 'bullmq';
import { GoogleGenerativeAI } from "@google/generative-ai";
import {getVectorStore} from "./utils.js"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

const vectorStore = await getVectorStore();

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

app.use(express.json());

app.post("/chat" , async (req,res)=> {
    const { message, history = [] } = req.body;

    if (!message) {
        return res.status(400).json({ error: "message is required" });
    }

    const similaritySearchResults = await vectorStore.similaritySearch(message, 2);

    const context = similaritySearchResults
        .map((doc, i) => `[${i + 1}] ${doc.pageContent}`)
        .join("\n\n");

    const SYSTEM_PROMPT = `You are a helpful AI assistant that answers user questions based on the provided context from uploaded documents.

Rules:
- If the answer is found in the context, answer using the context and mention "Source: document context".
- If the context is not relevant, answer using your own knowledge and mention "Source: general knowledge".
- If you are unsure, say so honestly.
- Use previous conversation history to understand follow-up questions.

Context:
${context}`;

    // Convert chat history to Gemini format
    const geminiHistory = history.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        history: geminiHistory,
    });

    const result = await chat.sendMessage(message);
    const answer = result.response.text();

    return res.json({ answer });
})

app.listen(8000 , ()=> {
    console.log("App is list 8000")
})

