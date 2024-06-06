const express = require("express");
const { generatePdfFromPrompt } = require("../controllers/promptController");
const router = express.Router();

router.route("/").get((req, res) => {
    res.send("Welcome to the PDF generation API");
})
router.route("/generate").post(generatePdfFromPrompt)

module.exports=router