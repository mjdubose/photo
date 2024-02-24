const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const SERVER_PORT = 3000;
const UPLOAD_DIRECTORY = "upload/";
const PUBLIC_DIRECTORY = "/public";

const getFilePath = (fileName) => path.join(__dirname, fileName);

// Definition for multer's diskStorage
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.access(UPLOAD_DIRECTORY, (error) => {
      if (error) {
        cb(error);
      } else {
        cb(null, UPLOAD_DIRECTORY);
      }
    });
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: multerStorage });

app.use(express.static(PUBLIC_DIRECTORY));
app.use("/upload", express.static(UPLOAD_DIRECTORY));

app.get("/", (req, res) => {
  res.sendFile(getFilePath(`${PUBLIC_DIRECTORY}/index.html`));
});

app.get("/images", (req, res) => {
  res.sendFile(getFilePath(`${PUBLIC_DIRECTORY}/viewImages.html`));
});

const createFileData = async (directory, fileName) => {
  return {
    name: fileName,
    time: fs.statSync(`${directory}/${fileName}`).mtime.getTime(),
  };
};

const getSortedFileData = async (directory) => {
  const fileNames = await fs.promises.readdir(directory);
  const filesData = await Promise.all(
    fileNames.map((fileName) => createFileData(directory, fileName)),
  );

  return filesData.sort((a, b) => b.time - a.time).map((file) => file.name);
};

app.get("/sortedPics", async (req, res) => {
  try {
    const sortedFiles = await getSortedFileData(UPLOAD_DIRECTORY);
    res.json(sortedFiles);
  } catch (error) {
    console.error(`Error getting sorted files : ${error}`);
    res.json([]);
  }
});

app.post("/upload", upload.single("files"), (req, res) => {
  res.status(200).send("File uploaded successfully!");
});

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});
