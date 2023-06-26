import { S3Event } from 'aws-lambda';
import resizeImage from 'resize-img';
import {
  S3Client,
  GetObjectCommandInput,
  GetObjectCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';

export const handler = async (event: S3Event) => {
  const fileProcessed = event.Records.map(async (record) => {
    const bucket = record.s3.bucket.name;
    const filename = record.s3.object.key;
    const fileFormat = filename.split('.')?.pop();

    if (!filename) return;
    // Get the file from s3
    const client = new S3Client({});

    console.log({ bucket, filename, fileFormat });

    const input: GetObjectCommandInput = {
      Bucket: bucket,
      Key: filename
    };
    const command = new GetObjectCommand(input);
    const { Body } = await client.send(command);

    if (!Body) {
      return;
    }

    const buffer = await streamToBuffer(Body as Readable);
    // resize image
    const resizedImage = await resizeImage(Buffer.concat(buffer), {
      width: 128,
      height: 128
    });

    // const outputFile = await gmSateToBuffer(resizedImage)

    console.log({ buffer, resizedImage });
    console.log({
      inputFile: buffer.length,
      outputFileLength: resizedImage.length
    });

    //upload resized imaged
    const putCommand = new PutObjectCommand({
      Bucket: 'zeilotech-images-dest',
      Key:
        filename.substring(0, filename.lastIndexOf('.')) +
        '-small.' +
        fileFormat,
      Body: resizedImage
    });

    await client.send(putCommand);
  });

  await Promise.all(fileProcessed);
  console.log('done');
  return 'done';
};

function streamToBuffer(stream: Readable): Promise<Buffer[]> {
  const buffers: Buffer[] = [];

  return new Promise((resolve, reject) => {
    stream.once('error', reject);

    stream.on('data', (data) => buffers.push(data));

    stream.on('end', () => resolve(buffers));
  });
}

// function gmSateToBuffer(state: gm.State): Promise<Buffer> {
//   return new Promise((resolve, reject) => {
//     state.toBuffer((error: Error | null, buffer: Buffer) => {
//       if(error) {
//         reject(error);
//       };

//       resolve(buffer);
//     })
//   })
// }
