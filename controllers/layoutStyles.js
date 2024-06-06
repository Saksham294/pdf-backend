const layoutStyles =(rgb)=> [
    // Style 1: Image on the left, text on the right
    (pageWidth, pageHeight, imgWidth, imgHeight) => ({
        imageX: 20,
        imageY: (pageHeight - imgHeight) / 2,
        textX: imgWidth + 40,
        fontColor:rgb(0,0,0),
        textYTitle: pageHeight - 80,
        textYSubtitle: pageHeight - 120
    }),
    // Style 2: Image on the right, text on the left
    (pageWidth, pageHeight, imgWidth, imgHeight) => ({
        imageX: pageWidth - imgWidth - 20,
        imageY: (pageHeight - imgHeight) / 2,
        textX: 20,
        fontColor:rgb(0,0,0),
        textYTitle: pageHeight - 80,
        textYSubtitle: pageHeight - 120
    }),
    // Style 3: Image at the top, text below
    (pageWidth, pageHeight, imgWidth, imgHeight) => ({
        imageX: (pageWidth - imgWidth) / 2,
        imageY: pageHeight - imgHeight - 20,
        textX: 20,
        fontColor:rgb(0,0,0),
        textYTitle: pageHeight - imgHeight - 40,
        textYSubtitle: pageHeight - imgHeight - 80
    }),
    // Style 4: Image at the bottom, text above
    (pageWidth, pageHeight, imgWidth, imgHeight) => ({
        imageX: (pageWidth - imgWidth) / 2,
        imageY: 20,
        textX: 20,
        fontColor:rgb(0,0,0),
        textYTitle: pageHeight - 150,
        textYSubtitle: pageHeight - 190
    }),
    // Style 5: Image centered with text overlay
    (pageWidth, pageHeight, imgWidth, imgHeight) => ({
        imageX: (pageWidth - imgWidth) / 2,
        imageY: (pageHeight - imgHeight) / 2,
        textX: (pageWidth - imgWidth) / 2 + 20,
        fontColor: rgb(1, 1, 1),
        textYTitle: (pageHeight + imgHeight) / 2 - 50,
        textYSubtitle: (pageHeight + imgHeight) / 2 - 90
    })
];

module.exports = layoutStyles;