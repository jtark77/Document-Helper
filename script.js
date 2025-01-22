/**************************************************************
  script.js

  - Tracks active editor (so formatting commands apply correctly)
  - Defines the DocumentationHelper module
  - Initializes placeholders
  - Saves/restores selection to allow color pickers to apply properly
  - importFile() updated to handle .docx, .pdf, .txt, images
    using Mammoth + PDF.js from CDNs
**************************************************************/

let activeEditor = null;
let savedRange = null; // Stores the user's text selection range

document.addEventListener("DOMContentLoaded", () => {
    
    const modalContent = document.getElementById("modalContent");
    const docPreview = document.getElementById("docPreview");

    // When user focuses/clicks inside the modal content
    modalContent.addEventListener("focus", () => {
        activeEditor = modalContent;
    });

    // When user focuses/clicks in the document preview
    docPreview.addEventListener("focus", () => {
        activeEditor = docPreview;
    });

    // Force execCommand to apply inline styles (for color changes)
    try {
        document.execCommand("styleWithCSS", false, true);
    } catch (e) {
        console.warn("styleWithCSS not supported:", e);
    }

    // Initialize placeholder behavior (for the .placeholder elements)
    document.querySelectorAll(".placeholder").forEach((el) => {
        if (el.textContent.trim() === "") {
            el.textContent = el.getAttribute("data-placeholder");
        }

        el.addEventListener("focus", function () {
            if (this.textContent === this.getAttribute("data-placeholder")) {
                this.textContent = "";
            }
        });

        el.addEventListener("blur", function () {
            if (this.textContent.trim() === "") {
                this.textContent = this.getAttribute("data-placeholder");
            }
        });
    });
});


function saveSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0);
    }
}


function restoreSelection() {
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
}


function saveSelectionAndOpenPicker(pickerId) {
    saveSelection();
    document.getElementById(pickerId).click();
}


function applyFormatting(command) {
    if (activeEditor) {
        activeEditor.focus();
    }
    try {
        document.execCommand(command, false, null);
    } catch (error) {
        console.error(`Error executing ${command}:`, error);
    }
}


function applyFontSize(px) {
    if (!px) return; // If user picked the placeholder "Font Size" option, do nothing.

    if (activeEditor) {
        activeEditor.focus();
    }
    document.execCommand("fontSize", false, "7");

    const fontElements = activeEditor.querySelectorAll('font[size="7"]');
    fontElements.forEach((fontEl) => {
        fontEl.removeAttribute("size");
        fontEl.style.fontSize = px + "px";
    });
}


function changeTextColor(color) {
    restoreSelection();
    if (activeEditor) {
        activeEditor.focus();
    }
    document.execCommand("foreColor", false, color);
}


function changeHighlightColor(color) {
    restoreSelection();
    if (activeEditor) {
        activeEditor.focus();
    }
    document.execCommand("hiliteColor", false, color);
}

/***********************************************************************
  DocumentationHelper Module
  - Manages templates, storing content, generating the doc preview, etc.
************************************************************************/
const DocumentationHelper = (() => {
    
    const topicContent = {};

   
    const templates = {
        troubleshooting: `
            <div>
                <h2 style="color: #0056b3;">Troubleshooting Guide</h2>
                <p><strong>Objective:</strong></p>
                <div class="placeholder" contenteditable="true" data-placeholder="Provide an objective for the troubleshooting process..."></div>

                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="border: 1px solid #ccc; padding: 8px;">Issue</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Cause</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Solution</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Additional Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="placeholder" contenteditable="true" data-placeholder="Enter issue details..."></td>
                            <td class="placeholder" contenteditable="true" data-placeholder="Enter possible causes..."></td>
                            <td class="placeholder" contenteditable="true" data-placeholder="Enter resolution steps..."></td>
                            <td class="placeholder" contenteditable="true" data-placeholder="Enter additional notes..."></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `,

        installation: `
            <div>
                <h2 style="color: #0056b3;">Installation Guide</h2>
                <p><strong>Purpose:</strong></p>
                <div class="placeholder" contenteditable="true" data-placeholder="Provide the purpose of the installation..."></div>

                <ol>
                    <li><strong>Prerequisites:</strong> 
                        <div class="placeholder" contenteditable="true" data-placeholder="List system requirements and necessary tools..."></div>
                    </li>
                    <li><strong>Installation Steps:</strong> 
                        <div class="placeholder" contenteditable="true" data-placeholder="Provide detailed step-by-step instructions..."></div>
                    </li>
                    <li><strong>Apply Settings:</strong> 
                        <div class="placeholder" contenteditable="true" data-placeholder="Explain how to configure settings after installation..."></div>
                    </li>
                    <li><strong>Verify Installation:</strong> 
                        <div class="placeholder" contenteditable="true" data-placeholder="How to test or verify the installation..."></div>
                    </li>
                </ol>
            </div>
        `,

        runbook: `
            <div>
                <h2 style="color: #0056b3;">System Runbook</h2>
                <p><strong>Purpose:</strong></p>
                <div class="placeholder" contenteditable="true" data-placeholder="Provide operational procedures for managing the system..."></div>

                <ul>
                    <li><strong>Startup:</strong> 
                        <div class="placeholder" contenteditable="true" data-placeholder="Steps to initialize the system..."></div>
                    </li>
                    <li><strong>Shutdown:</strong> 
                        <div class="placeholder" contenteditable="true" data-placeholder="Process for safely shutting down the system..."></div>
                    </li>
                    <li><strong>Monitoring:</strong> 
                        <div class="placeholder" contenteditable="true" data-placeholder="Key metrics to track..."></div>
                    </li>
                    <li><strong>Emergency Recovery:</strong> 
                        <div class="placeholder" contenteditable="true" data-placeholder="Recovery steps for system failure..."></div>
                    </li>
                </ul>

                <h3 style="color: #0056b3;">Known Issues</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="border: 1px solid #ccc; padding: 8px;">Issue</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Resolution</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="placeholder" contenteditable="true" data-placeholder="Enter known issue..." style="border: 1px solid #ccc; padding: 8px;"></td>
                            <td class="placeholder" contenteditable="true" data-placeholder="Enter resolution steps..." style="border: 1px solid #ccc; padding: 8px;"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `,

        changelog: `
            <div>
                <h2 style="color: #0056b3;">Change Log</h2>
                <p><strong>Purpose:</strong></p>
                <div class="placeholder" contenteditable="true" data-placeholder="Document changes, updates, or modifications..."></div>

                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="border: 1px solid #ccc; padding: 8px;">Date</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Change Description</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Author</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Impact</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Approval Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="placeholder" contenteditable="true" data-placeholder="Enter date..." style="border: 1px solid #ccc; padding: 8px;"></td>
                            <td class="placeholder" contenteditable="true" data-placeholder="Describe the change..." style="border: 1px solid #ccc; padding: 8px;"></td>
                            <td class="placeholder" contenteditable="true" data-placeholder="Enter author's name..." style="border: 1px solid #ccc; padding: 8px;"></td>
                            <td class="placeholder" contenteditable="true" data-placeholder="State the impact..." style="border: 1px solid #ccc; padding: 8px;"></td>
                            <td class="placeholder" contenteditable="true" data-placeholder="Approval status..." style="border: 1px solid #ccc; padding: 8px;"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `,

        userguide: `
            <div>
                <h2 style="color: #0056b3;">User Guide</h2>
                <p><strong>Purpose:</strong></p>
                <div class="placeholder" contenteditable="true" data-placeholder="Detailed instructions for users..."></div>

                <ol>
                    <li><strong>Introduction:</strong>
                        <div class="placeholder" contenteditable="true" data-placeholder="Overview of the system..."></div>
                    </li>
                    <li><strong>Basic Tasks:</strong>
                        <div class="placeholder" contenteditable="true" data-placeholder="Common tasks..."></div>
                    </li>
                    <li><strong>Advanced Features:</strong>
                        <div class="placeholder" contenteditable="true" data-placeholder="Explain advanced tools..."></div>
                    </li>
                    <li><strong>Support:</strong>
                        <div class="placeholder" contenteditable="true" data-placeholder="Contact details for assistance..."></div>
                    </li>
                </ol>
            </div>
        `,

        issueresolution: `
            <div>
                <h2 style="color: #0056b3;">Issue Resolution Template</h2>
                <p><strong>Purpose:</strong></p>
                <div class="placeholder" contenteditable="true" data-placeholder="Document solutions for known issues..."></div>

                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="border: 1px solid #ccc; padding: 8px;">Issue</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Impact</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Resolution Steps</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Responsible Team/Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="placeholder" contenteditable="true" data-placeholder="Describe the issue..."></td>
                            <td class="placeholder" contenteditable="true" data-placeholder="State the impact..."></td>
                            <td class="placeholder" contenteditable="true" data-placeholder="Outline resolution steps..."></td>
                            <td class="placeholder" contenteditable="true" data-placeholder="Provide contact details..."></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `,
    };

    
    function applyTemplate() {
        const selectedTemplate = document.getElementById("templateSelect").value;
        if (selectedTemplate === "none") {
            // Clear the modal
            document.getElementById("modalContent").innerHTML = "";
        } else if (templates[selectedTemplate]) {
            document.getElementById("modalContent").innerHTML = templates[selectedTemplate];
        } else {
            document.getElementById("modalContent").innerHTML = "";
        }
    }
    window.applyTemplate = applyTemplate;

   
    function generateDocument() {
        const creationDate = document.getElementById("creationDate").value || "";
        const createdBy = document.getElementById("createdBy").value || "";
        const updateDate = document.getElementById("updateDate").value || "";
        const updatedBy = document.getElementById("updatedBy").value || "";

        const metaTable = `
            <table style="margin: 0 auto; border-collapse: collapse; text-align: center;">
              <tr>
                <td style="border: 1px solid #333; padding: 8px;"><strong>Creation Date</strong></td>
                <td style="border: 1px solid #333; padding: 8px;">${creationDate}</td>
                <td style="border: 1px solid #333; padding: 8px;"><strong>Created By</strong></td>
                <td style="border: 1px solid #333; padding: 8px;">${createdBy}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #333; padding: 8px;"><strong>Update Date</strong></td>
                <td style="border: 1px solid #333; padding: 8px;">${updateDate}</td>
                <td style="border: 1px solid #333; padding: 8px;"><strong>Updated By</strong></td>
                <td style="border: 1px solid #333; padding: 8px;">${updatedBy}</td>
              </tr>
            </table>
        `;

        const title = document.getElementById("docTitle").value || "Untitled";
        const purpose = document.getElementById("purpose").value || "No Purpose.";
        const topics = document.getElementById("topics").value
            .split("\n")
            .filter(Boolean);

        let preview = `
            <h1 style="text-align:center;">${title}</h1>

            ${metaTable}

            <h2>Purpose</h2>
            <p>${purpose}</p>
            <h2>Topics</h2>
            <ul>
                ${topics
                .map((t) => `<li><a href="#" class="topic-link" data-topic="${t}">${t}</a></li>`)
                .join("")}
            </ul>
        `;

        topics.forEach((t) => {
            preview += `
                <h3 id="${t}">${t}</h3>
                <p>${topicContent[t] || "No content yet."}</p>
            `;
        });

        document.getElementById("docPreview").innerHTML = preview;
        attachLinkEvents();
    }

    function attachLinkEvents() {
        document.querySelectorAll(".topic-link").forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                openModal(link.dataset.topic);
            });
        });
    }

    function openModal(topic) {
        document.getElementById("modalTopicName").innerText = topic;
        document.getElementById("modalContent").innerHTML =
            topicContent[topic] || "";
        document.getElementById("topicModal").style.display = "block";
    }

    function closeModal() {
        document.getElementById("topicModal").style.display = "none";
    }

    function saveTopicContent() {
        
        const topic = document.getElementById("modalTopicName").innerText;
        // Grab the content from #modalContent
        const modalHTML = document.getElementById("modalContent").innerHTML;

        // Save it to topicContent
        topicContent[topic] = modalHTML;

       
        generateDocument();
        closeModal();
    }

    function saveAsPDF() {
        alert("PDF export not implemented in this demo.");
    }

    function saveAsDOCX() {
        const html = document.getElementById("docPreview").innerHTML;
        const blob = window.htmlDocx.asBlob(html);
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "document.docx";
        link.click();
    }

    async function importFile() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".docx,.pdf,.txt,.png,.jpg,.jpeg";

        input.onchange = async (evt) => {
            const file = evt.target.files[0];
            if (!file) return;

            const editor = document.getElementById("modalContent");
            const fileType = file.type || "";
            const fileName = file.name || "";

            const fileToArrayBuffer = (f) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsArrayBuffer(f);
            });

            const fileToText = (f) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsText(f);
            });

            const fileToDataURL = (f) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(f);
            });

            
            if (fileType.startsWith("image/")) {
                const dataURL = await fileToDataURL(file);
                editor.innerHTML += `<img src="${dataURL}" alt="${fileName}" style="max-width:100%;">`;
                return;
            }

          
            if (fileType.startsWith("text/")) {
                const text = await fileToText(file);
                editor.innerHTML += `<p>${text}</p>`;
                return;
            }

           
            if (
                fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                fileName.toLowerCase().endsWith(".docx")
            ) {
                try {
                    const arrayBuffer = await fileToArrayBuffer(file);
                    const result = await window.mammoth.convertToHtml({ arrayBuffer });
                    editor.innerHTML += result.value;
                } catch (err) {
                    console.error("DOCX parse error:", err);
                    alert("Error importing DOCX. Check console.");
                }
                return;
            }

            
            if (fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
                try {
                    const arrayBuffer = await fileToArrayBuffer(file);
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                    let pdfHtml = `<div><strong>Imported PDF: ${fileName}</strong></div>`;
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 1.0 });
                        const canvas = document.createElement("canvas");
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        const ctx = canvas.getContext("2d");

                        await page.render({ canvasContext: ctx, viewport }).promise;
                        const pageImg = canvas.toDataURL("image/png");
                        pdfHtml += `<img src="${pageImg}" alt="Page ${i}" style="display:block; margin-bottom:10px;">`;
                    }
                    editor.innerHTML += pdfHtml;
                } catch (err) {
                    console.error("PDF parse error:", err);
                    alert("Error importing PDF. Check console.");
                }
                return;
            }

            alert("Unsupported file type: " + fileType);
        };

        input.click();
    }

    return {
        generateDocument,
        saveAsPDF,
        saveAsDOCX,
        closeModal,
        saveTopicContent,
        importFile,
        changeTextColor,
        changeHighlightColor,
    };
})();

// Expose globally
window.generateDocument = DocumentationHelper.generateDocument;
window.saveAsPDF = DocumentationHelper.saveAsPDF;
window.saveAsDOCX = DocumentationHelper.saveAsDOCX;
window.closeModal = DocumentationHelper.closeModal;
window.saveTopicContent = DocumentationHelper.saveTopicContent;
window.importFile = DocumentationHelper.importFile;
window.changeTextColor = DocumentationHelper.changeTextColor;
window.changeHighlightColor = DocumentationHelper.changeHighlightColor;
