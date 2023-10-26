# Bun API 

## Environment variables 

All environment variables from any `.env` files are automatically loaded into `process.env`, so just use `process.env` to access any environment variables. 

## Files

### Writing files

Use the async `Bun.write(filepath, data)` method to write data to a file

```javascript
await Bun.write("output.txt", "this is output file")
```

### Reading Files

You can get a file representation in bun by using the async `Bun.file(filepath)` method, which returns a file. 

```javascript
const file = await Bun.file("output.txt")
```
Then on the file object, you have these async methods to read data in from different specified encodings: 
- `file.text()` : returns the utf8 text file content
- `file.stream()` : returns the file content as a readable stream
- `file.arrayBuffer()` : returns the file content as an array buffer