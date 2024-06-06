const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function createPdf(pages) {
    try {
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontColor = rgb(0, 0, 0);
        
        const layoutStyles = [
            // Style 1: Image on the left, text on the right
            (pageWidth, pageHeight, imgWidth, imgHeight) => ({
                imageX: 20,
                imageY: (pageHeight - imgHeight) / 2,
                textX: imgWidth + 40,
                textYTitle: pageHeight - 80,
                textYSubtitle: pageHeight - 120
            }),
            // Style 2: Image on the right, text on the left
            (pageWidth, pageHeight, imgWidth, imgHeight) => ({
                imageX: pageWidth - imgWidth - 20,
                imageY: (pageHeight - imgHeight) / 2,
                textX: 20,
                textYTitle: pageHeight - 80,
                textYSubtitle: pageHeight - 120
            }),
            // Style 3: Image at the top, text below
            (pageWidth, pageHeight, imgWidth, imgHeight) => ({
                imageX: (pageWidth - imgWidth) / 2,
                imageY: pageHeight - imgHeight - 20,
                textX: 20,
                textYTitle: pageHeight - imgHeight - 40,
                textYSubtitle: pageHeight - imgHeight - 80
            }),
            // Style 4: Image at the bottom, text above
            (pageWidth, pageHeight, imgWidth, imgHeight) => ({
                imageX: (pageWidth - imgWidth) / 2,
                imageY: 20,
                textX: 20,
                textYTitle: pageHeight - 150,
                textYSubtitle: pageHeight - 190
            }),
            // Style 5: Image centered with text overlay
            (pageWidth, pageHeight, imgWidth, imgHeight) => ({
                imageX: (pageWidth - imgWidth) / 2,
                imageY: (pageHeight - imgHeight) / 2,
                textX: (pageWidth - imgWidth) / 2 + 20,
                textYTitle: (pageHeight + imgHeight) / 2 - 50,
                textYSubtitle: (pageHeight + imgHeight) / 2 - 90
            })
        ];
        
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
            const jpgImage = await pdfDoc.embedJpg(imageBytes);
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

            // Define positions
            let imageX, imageY, textX, textYTitle, textYSubtitle;

            if (i === 0) {
                // First page: Overlay text on the image
                imageX = (pageWidth - imgWidth) / 2;
                imageY = (pageHeight - imgHeight) / 2;

                textX = imageX + 20;
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
                font: font,
                color: fontColor,
                maxWidth: pageWidth - 40
            });

            // Add subtitle text below the title
            page.drawText(subtitleText, {
                x: textX,
                y: textYSubtitle,
                size: fontSizeSubtitle,
                font: font,
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

const pages = [
    {
        imageUrl: 'https://wallpapercave.com/wp/wp4471355.jpg',
        titleText: 'Title 1',
        subtitleText: 'Subtitle 1'
    },
    {
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM66lZsb54vrCaiu-7bYok2GaCk4E_5jG7hw&s',
        titleText: 'Title 2',
        subtitleText: 'Subtitle 2'
    },
    {
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM66lZsb54vrCaiu-7bYok2GaCk4E_5jG7hw&s',
        titleText: 'Title 3',
        subtitleText: 'Subtitle 3'
    },
    {
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM66lZsb54vrCaiu-7bYok2GaCk4E_5jG7hw&s',
        titleText: 'Title 4',
        subtitleText: 'Subtitle 4'
    },
    {
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM66lZsb54vrCaiu-7bYok2GaCk4E_5jG7hw&s',
        titleText: 'Title 5',
        subtitleText: 'Subtitle 5'
    },
    {
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM66lZsb54vrCaiu-7bYok2GaCk4E_5jG7hw&s',
        titleText: 'Title 6',
        subtitleText: 'Subtitle 6'
    }
];

createPdf(pages);
