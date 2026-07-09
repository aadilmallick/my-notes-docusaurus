## Basics

### making requests

### basic server

When creating the server with the `createServer()` method, it takes in a callback that provides the `req` and `res` request and response representations for the client-response cycle respectively.

```ts
import { createServer } from "node:http"

// 1. create the server
const server = createServer((req, res) => {

	// 2. write response headers, read request info
    res.writeHead(200, { "Content-Type" : "text/html" });
    console.log(`${req.method} at ${req.url}`)

	// 3. end the response with some content.
    res.end(`<h1>hello world</h1>`)

})

// 4. start the server on a port
server.listen(3000)

console.log(`server is listening on http://localhost:3000`)

```

Here are the properties you have available on the `req` object:

- `req.url`: the pathname of the request URL
- `req.method`: the HTTP method of the request

Here are the properties you have available on the `res` object:

- `res.writeHead(statusCode, headers)`: writes the status code of the response and headers to attach to the response.
- `res.end(body)`: ends the response body and sends the response back to the client.

### File server

To server static files from our server, it's important to stream them back to the client using readable streams because they are efficient for serving files since it streams data instead of loading the entire file into memory at once.

We use the `createReadStream()` function from the `node:fs` module to create a readable stream of a file producer and then pipe it to a response consumer:

```ts
// writes headers and then streams the file content to the response
function sendFile({res, statusCode, mimetype, filename}) {
    res.writeHead(statusCode, { "Content-Type" : mimetype })
    createReadStream(filename).pipe(res)
}
```

here's a complete example:

```ts
import { createServer } from "node:http"
import { createReadStream } from "node:fs"


// writes headers and then streams the file content to the response
function sendFile({res, statusCode, mimetype, filename}) {
    res.writeHead(statusCode, { "Content-Type" : mimetype })
    createReadStream(filename).pipe(res)
}


const server = createServer((req, res) => {

    console.log(`${req.method} at ${req.url}`)

    switch(req.url) {
        case "/":
            return sendFile({
                res,
                statusCode: 200,
                mimetype: "text/html",
                filename: "static/index.html"        
            })
        default:
            res.writeHead(404, { "Content-Type" : 'text/plain' })
            res.send("404 brah")    
    }
})

server.listen(3000)

console.log(`server is listening on http://localhost:3000`)
```

> [!NOTE]
> When you use `createReadStream().pipe(res)` to serve files in Node.js, the stream takes care of sending the data in chunks and automatically ends the response when the file is fully sent. So, you don't need to call `res.end()` explicitly because the stream handles it for you. 

#### Handling range requests

For large static files like videos, browsers also handle **range requests** to request a certain range of bytes from a stream instead of the entire stream as to save memory on the client.

Here is how to handle a range request:

```ts
import { createServer } from "node:http"
import { createReadStream } from "node:fs"
import fs from "node:fs/promises"

// 1. send entire range
function sendFile({res, statusCode, mimetype, filename}) {
    res.writeHead(statusCode, { "Content-Type" : mimetype })
    createReadStream(filename).pipe(res)
}

// 2. parse req.headers.range
const parseRange = (range: string, filesize: number) => {
    let [start, end] = range.replace(/bytes=/, '').split('-')
    start = parseInt(start, 10)
    end = end ? parseInt(end, 10) : filesize - 1
    
    console.log({start, end})
    return {
        start,
        end,
        contentLength: (end-start) + 1
    }
}

async function serveLargeFile(req, res, { filename, mimetype }) {
    const { size } = await fs.stat(filename)
    const range = req.headers.range;
    
    // if range request, return range of stream
    if (range) {
        const { start, end, contentLength } = parseRange(range, size)
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': mimetype
        })
        createReadStream(filename, {start, end}).pipe(res)
    }

	// else return entire file
    else {
          return sendFile({
            res,
            statusCode: 200,
            mimetype,
            filename
          }) 
    }
}


const server = createServer((req, res) => {

    console.log(`${req.method} at ${req.url}`)

    switch(req.url) {
        case "/":
            return sendFile({
                res,
                statusCode: 200,
                mimetype: "text/html",
                filename: "static/index.html"        
            })
        case "/video":
          return serveLargeFile(req, res, {
                filename: "operating-systems-course.mkv",
                mimetype: "video/x-matroska"
            }) 
        default:
            res.writeHead(404, { "Content-Type" : 'text/plain' })
            res.send("404 brah")    
    }
})

server.listen(3000)

console.log(`server is listening on http://localhost:3000`)
```

> [!IMPORTANT]
> It's extremely important to handle range requests in your server when serving large videos, audio, or images, because browsers like Safari do not work unless you handle range requests.


#### Handling multipart form data uploads

```ts
import { createServer } from "node:http"
import { createReadStream, createWriteStream } from "node:fs"
import fs from "node:fs/promises"
import multiparty from "npm:multiparty"

function sendFile({res, statusCode, mimetype, filename}) {
    res.writeHead(statusCode, { "Content-Type" : mimetype })
    createReadStream(filename).pipe(res)
}

const parseRange = (range: string, filesize: number) => {
    let [start, end] = range.replace(/bytes=/, '').split('-')
    start = parseInt(start, 10)
    end = end ? parseInt(end, 10) : filesize - 1
    
    console.log({start, end})
    return {
        start,
        end,
        contentLength: (end-start) + 1
    }
}

async function serveLargeFile(req, res, { filename, mimetype }) {
    const { size } = await fs.stat(filename)
    const range = req.headers.range;
    if (range) {
        const { start, end, contentLength } = parseRange(range, size)
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': mimetype
        })
        createReadStream(filename, {start, end}).pipe(res)
    }

    else {
          return sendFile({
            res,
            statusCode: 200,
            mimetype,
            filename
          }) 
    }
}

function renderHTML(res, html: string) {
    res.writeHead(200, { "Content-Type" : 'text/html' })
    res.end(html)    
}


function parseMultipartForm(req) {
    let form = new multiparty.Form();
    const {promise, resolve, reject } = Promise.withResolvers()
    const formData = form.parse(req)
    form.on('part', (part) => {
        resolve({
            part,
            formData
        })
    })
    return promise
}

const server = createServer(async (req, res) => {

    console.log(`${req.method} at ${req.url}`)
    
    if (req.method === 'POST') {
        const {part, formData} = await parseMultipartForm(req)
        part.pipe(createWriteStream(`uploads/${part.filename}`))
            .on('close', () => {
                console.log('finished write stream!')
                return renderHTML(res, `<h1>file uploaded: ${part.filename}</h1>`)
            })
    }
    
    if (req.method === 'GET') {

        switch(req.url) {
            case "/":
                return sendFile({
                    res,
                    statusCode: 200,
                    mimetype: "text/html",
                    filename: "static/index.html"        
                })
            case "/video":
              return serveLargeFile(req, res, {
                    filename: "operating-systems-course.mkv",
                    mimetype: "video/x-matroska"
                }) 
            case "/upload":
                return renderHTML(res, `
                    <form enctype="multipart/form-data" method="POST" action="/">
                        <input type="file" name="upload-file" />
                        <button>Upload File</button>
                    </form>                
                `)
            default:
                res.writeHead(404, { "Content-Type" : 'text/plain' })
                res.end("404 brah")    
        }
    }
})

server.listen(3000)

console.log(`server is listening on http://localhost:3000`)

```