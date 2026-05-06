import { Worker } from 'bullmq';

const connection = {
    host : 'localhost',
    port : 6380
}

const worker = new Worker(
  'RAG-pdf',
  async (job) => {
    // Will print { foo: 'bar'} for the first job
    // and { qux: 'baz' } for the second.
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