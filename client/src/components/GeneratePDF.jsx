// src/components/GeneratePDF.jsx
import html2canvas from "html2canvas"; // html2canvas is needed to convert HTML elements to images
import { jsPDF } from "jspdf"; // Directly import jsPDF

/**
 * Generates a multi-page PDF from a container element containing individual page elements.
 * Each element with the class 'pdf-page' within the specified container will be treated as a separate page in the PDF.
 *
 * @param {string} elementSelector - The CSS selector for the main container element that holds all the individual 'pages'.
 * @param {string} filename - The desired filename for the generated PDF.
 * @param {Object} [options={}] - Optional configuration for html2canvas and jsPDF.
 * @param {Object} [options.html2canvas={}] - Options passed directly to html2canvas.
 */
const generatePdf = async (elementSelector, filename, options = {}) => {
  try {
    // 1. Get the main report container element
    const reportContainer = document.querySelector(elementSelector);
    if (!reportContainer) {
      console.error(`Container element with selector "${elementSelector}" not found.`);
      return "error";
    }

    // 2. Find all individual page elements within the container
    // These are the elements that represent each distinct page in your report
    const pageElements = Array.from(reportContainer.querySelectorAll('.pdf-page'));

    if (pageElements.length === 0) {
      console.error("No elements with class 'pdf-page' found within the report container.");
      return "error";
    }

    // 3. Initialize a new jsPDF document
    const doc = new jsPDF({
      unit: 'mm',        // Unit for measurements (millimeters)
      format: 'a4',      // Page format (A4)
      orientation: 'portrait' // Page orientation (portrait)
    });

    // Default options for html2canvas to ensure good quality
    const defaultHtml2CanvasOptions = {
      scale: 2,        // Scale factor for rendering (higher means better resolution)
      useCORS: true,   // Important if you have images from different origins
      logging: true,   // Enable logging for debugging html2canvas issues
    };

    // 4. Iterate through each page element and add it to the PDF
    for (let i = 0; i < pageElements.length; i++) {
      const pageElement = pageElements[i];

      // Convert the current page element to a canvas (image)
      // We merge default options with any custom html2canvas options passed in
      const canvas = await html2canvas(pageElement, {
        ...defaultHtml2CanvasOptions,
        ...options.html2canvas // Allow overriding html2canvas options
      });

      // Convert the canvas image to a data URL (JPEG format for smaller file size)
      const imgData = canvas.toDataURL('image/jpeg', 1.0); // 1.0 is max quality

      // Define A4 dimensions for the PDF page
      const imgWidth = 210;  // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calculate height to maintain aspect ratio

      // Add a new page to the jsPDF document if it's not the first page
      if (i > 0) {
        doc.addPage();
      }

      // Add the image of the current page to the PDF
      // Parameters: imgData, format ('JPEG'), x-pos, y-pos, width, height
      doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

      console.log(`Processed page element ${i + 1}/${pageElements.length}`);
    }

    // 5. Save the generated PDF
    doc.save(filename || 'document.pdf');
    return "success";
  } catch (error) {
    console.error('Error generating PDF:', error);
    return "error";
  }
};

export default generatePdf;