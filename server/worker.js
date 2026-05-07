import { Worker } from 'bullmq';
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

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
    console.log(splitDocs[0]);

    console.log(job.data);
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