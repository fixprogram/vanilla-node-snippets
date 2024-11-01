import { createServer } from "node:http";
import { parse, fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

createServer(async (req, res) => {
  if (req.method === "GET") {
    // Serve the upload form
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="image" />
        <input type="submit" value="Upload Image" />
      </form>
    `);
    return;
  }

  if (req.method === "POST") {
    const contentType = req.headers["content-type"];
    console.log("contentType: ", contentType);
    const boundary = contentType.split("boundary=")[1];
    if (!boundary) {
      res.writeHead(400);
      res.end("No boundary in multipart/form-data");
      return;
    }

    let chunks = [];

    for await (let chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const bufferString = buffer.toString("latin1");
    const parts = bufferString.split(`--${boundary}`);

    // Remove any empty strings or extra '--' at the end
    parts.shift();
    parts.pop();

    parts.forEach((part) => {
      part = part.trim();
      if (!part) return;

      const [headerPart, content] = part.split("\r\n\r\n");
      const headers = headerPart.split("\r\n");
      const headerObj = {};

      headers.forEach((headerLine) => {
        const [key, value] = headerLine.split(": ");
        headerObj[key.toLowerCase()] = value;
      });

      const contentDisposition = headerObj["content-disposition"];
      if (contentDisposition) {
        const matches = contentDisposition.match(/name="([^"]+)"(?:;\s*filename="([^"]+)")?/);
        const name = matches[1];
        const filename = matches[2];

        if (filename) {
          const contentBuffer = Buffer.from(content, "latin1");

          // Ensure the uploads directory exists
          const uploadDir = path.join(__dirname, "uploads");
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
          }

          const filePath = path.join(uploadDir, path.basename(filename));

          fs.writeFile(filePath, contentBuffer, (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log(`File saved: ${filename}`);
            }
          });
        }
      }
    });

    console.log("buffer: ", buffer);
  }

  res.statusCode = 200;
  res.end("Hello World!");
}).listen(3000, () => console.log("Server is running on http://localhost:3000"));
