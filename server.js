// Require the modules
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create an express app
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Define the port
const port = 3000;

const uploadDir = "upload/";

// Define the storage destination and filename for the uploaded file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload"); // The upload folder must exist
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });

// Serve the index.html file from the public folder
app.use(express.static("public"));
app.use("/upload", express.static("upload"));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/images", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/viewImages.html"));
});

app.get("/sortedPics", function (req, res) {
  const getSortedFiles = async (dir) => {
    const files = await fs.promises.readdir(dir);

    return files
      .map((fileName) => ({
        name: fileName,
        time: fs.statSync(`${dir}/${fileName}`).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time)
      .map((file) => file.name);
  };

  getSortedFiles(uploadDir)
    .then(function (fileNames) {
      res.json(fileNames);
    })
    .catch(function (error) {
      console.log(error);
      res.json([]);
    });
});

// Define a route to handle the file upload
app.post("/upload", upload.single("files"), (req, res) => {
  // req.file is the file object
  // req.body will hold the text fields, if there were any
  res.send("File uploaded successfully!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
