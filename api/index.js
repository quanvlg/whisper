const express = require("express");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
app.use(express.static("public")); // 👈 thêm dòng này
const upload = multer({ dest: "/data" });

// upload file audio
app.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const form = new FormData();
    form.append("audio_file", fs.createReadStream(filePath));
    form.append("language", "vi");

    const response = await axios.post(
      "http://whisper:9000/asr",
      form,
      {
        headers: form.getHeaders()
      }
    );

    // xoá file sau khi xử lý
    fs.unlinkSync(filePath);
    console.log("WHISPER RESPONSE:", response.data);

    const resultText =
    response.data.text ||
    response.data.result ||
    JSON.stringify(response.data);

    res.json({
    success: true,
    text: resultText
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.listen(3000, () => {
  console.log("API chạy tại http://localhost:3000");
});