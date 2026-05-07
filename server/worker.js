import { Worker } from 'bullmq';
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embeddings } from "./utils.js";

const connection = {
    host : 'localhost',
    port : 6380
}

const worker = new Worker(
  'RAG-pdf',
  async (job) => {
    const data = JSON.parse(job.data);

    // load the pdf
    const path = data.path;
    const loader = new PDFLoader(path);
    const docs = await loader.load()

    // chunk
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`the number of docs are ${splitDocs.length}`);

    // store in qdrant
    await QdrantVectorStore.fromDocuments(splitDocs, embeddings, {
      url: process.env.QDRANT_URL || "http://localhost:6333",
      collectionName: "pdf-docs",
    });

    console.log(`Stored ${splitDocs.length} chunks in Qdrant`);
  },
  { connection },
);

// queueEvents.on('progress', ({ jobId, data }, timestamp) => {
//   console.log(`${jobId} reported progress ${data} at ${timestamp}`);
// });

worker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});