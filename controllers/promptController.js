const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fetch = require('node-fetch');
const fs = require('fs');
const { OpenAI } = require('openai');
const path = require('path');
const layoutStyles=require("./layoutStyles")

// Function to create PDF
async function createPdf(pages) {
    try {
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
        const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontColor = rgb(0,0,0);
        
        for (let i = 0; i < pages.length; i++) {
            const { imageUrl, titleText, subtitleText } = pages[i];

            // Fetch the image
            const response = await fetch(imageUrl);
            const imageBytes = await response.arrayBuffer();

            // Create a new page with custom size
            const pageWidth = 550;
            const pageHeight = 550;
            const page = pdfDoc.addPage([pageWidth, pageHeight]);

            // Embed the image
            const jpgImage = await pdfDoc.embedPng(imageBytes);
            let imgWidth = jpgImage.width;
            let imgHeight = jpgImage.height;

            // Scale the image if it's too large
            const maxImgWidth = pageWidth - 40;
            const maxImgHeight = pageHeight - 200; // Reserve space for text
            if (imgWidth > maxImgWidth) {
                const scale = maxImgWidth / imgWidth;
                imgWidth = maxImgWidth;
                imgHeight *= scale;
            }
            if (imgHeight > maxImgHeight) {
                const scale = maxImgHeight / imgHeight;
                imgHeight = maxImgHeight;
                imgWidth *= scale;
            }

            // Define positions for image, title, and subtitle
            let imageX, imageY, textX, textYTitle, textYSubtitle;

            if (i === 0) {
                // First page: Overlay text on the image
                imageX = (pageWidth - imgWidth) / 2;
                imageY = (pageHeight - imgHeight) / 2;

                textX = imageX;
                textYTitle = imageY + imgHeight - 50;
                textYSubtitle = textYTitle - 40;
            } else {
                // If number of pages exceeds the number of layout styles, loop back to the first style using modulo operation
                const style = layoutStyles[(i - 1) % layoutStyles.length](pageWidth, pageHeight, imgWidth, imgHeight);

                imageX = style.imageX;
                imageY = style.imageY;
                textX = style.textX;
                textYTitle = style.textYTitle;
                textYSubtitle = style.textYSubtitle;
            }

            // Draw the image on the page
            page.drawImage(jpgImage, {
                x: imageX,
                y: imageY,
                width: imgWidth,
                height: imgHeight
            });

            // Add title text
            const fontSizeTitle = 30;
            const fontSizeSubtitle = 20;

            page.drawText(titleText, {
                x: textX,
                y: textYTitle,
                size: fontSizeTitle,
                font: boldFont,
                color: fontColor,
                maxWidth: pageWidth - 40
            });

            // Add subtitle text below the title
            page.drawText(subtitleText, {
                x: textX,
                y: textYSubtitle,
                size: fontSizeSubtitle,
                font: regularFont,
                color: fontColor,
                maxWidth: pageWidth - 40
            });
        }

        const pdfBytes = await pdfDoc.save();

        // Save the PDF to a file
        fs.writeFileSync('output.pdf', pdfBytes);
        console.log('PDF created successfully');
    } catch (error) {
        console.error('Error creating PDF:', error);
    }
}

// Function to generate the image and text, then create the PDF
exports.generatePdfFromPrompt = async (req, res) => {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })

        //Declare Pages array
        let pagesArray = [];
        //Total Number of Pages
        const pages = req.body.pages;
        const text = req.body.text;
        
        //Iterate over number of pages and generate image and text for each
        for (let i = 1; i < pages + 1; i++) {
            const imagePrompt = `You are given the following instructions: "${text}". 
             Follow the order of pages and which page has what image.
             Ensure the image has no text on it.
             Create an amazing image based on the text for the page ${i}.`;

            // Generate image using DALL-E
            const imageResponse = await openai.images.generate({
                model: "dall-e-2",
                size: i == 1 ? "512x512" : "256x256",
                prompt: imagePrompt,
                n: 1,
            });
            const imageUrl = imageResponse.data[0].url;

            const textPrompt = `You are given the following prompt:
                                "${text}".
                                On the basis of this, extract all necessary details of the text.
                                Follow the order of pages and find which page has what text.
                                Give the output only for the page which is asked for.
                                Based on this create text for ${i}th page.`;
            // Generate text using GPT-4
            const textResponse = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: textPrompt }]
            });
            const generatedText = textResponse.choices[0].message.content;

            // Extract title and subtitle from generated text
            let titleText = generatedText.split('\n')[0]; // Assuming the first line as title
            titleText = titleText.replace(/^title:\s*/i, '').trim()
            let subtitleText = generatedText.split('\n').slice(1).join('\n'); // Rest as subtitle
            subtitleText = subtitleText.replace(/^subtitle:\s*/i, '').trim()
            pagesArray.push({
                page: i,
                imageUrl,
                titleText,
                subtitleText
            })
        }

        // Path to save the PDF
        const pdfPath = path.resolve(__dirname, '../output.pdf');

        // Create the PDF
        await createPdf(pagesArray, pdfPath);

        if (fs.existsSync(pdfPath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');

            res.status(200).sendFile(pdfPath);
        } else {
            res.status(500).send('Error: PDF file was not created.');
        }

    } catch (error) {
        console.error('Error generating PDF from prompt:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating PDF from prompt. Please try again'
        });
    }
}
