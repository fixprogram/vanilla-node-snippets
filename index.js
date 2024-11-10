import express from "express";
import multer from "multer";
import { createGzip } from "node:zlib";
import { Readable } from "node:stream";

const app = express();
const upload = multer();

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>File Upload and Compression</title>
    </head>
    <body>
      <h1>Upload a file to compress</h1>
      <form action="/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="file" required />
        <button type="submit">Upload and Compress</button>
      </form>
    </body>
    </html>
  `);
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  // Create a gzip stream to compress the uploaded file
  const gzipStream = createGzip();

  // Set the response headers for the compressed file
  res.setHeader("Content-Disposition", `attachment; filename=${req.file.originalname}.gz`);
  res.setHeader("Content-Type", "application/gzip");

  // Pipe the uploaded file (req.file.buffer) through the gzip stream and into the response
  const readableStream = Readable.from(req.file.buffer);
  readableStream
    .pipe(gzipStream) // Compress the file
    .pipe(res) // Stream the compressed file back to the client
    .on("finish", () => {
      console.log("File successfully compressed and sent to client");
    });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
