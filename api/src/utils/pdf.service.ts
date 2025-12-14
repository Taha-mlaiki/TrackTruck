import PDFDocument from "pdfkit";

export class PdfService {
  async generateTripPdfBuffer(trip: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(20).text("Trip Mission Order", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Reference: ${trip.reference || trip._id}`);
      doc.text(`Driver: ${trip.driver?.name ?? trip.driver}`);
      doc.text(`Truck: ${trip.truck?.plateNumber ?? trip.truck}`);
      doc.text(`From: ${trip.origin}  To: ${trip.destination}`);
      doc.text(`Planned Start: ${trip.plannedStart}`);
      doc.moveDown();


      doc.text("Remarks:");
      doc.text("__________________________________________");
      doc.moveDown(2);

      doc.text("Signature: __________________________", { align: "right" });

      doc.end();
    });
  }
}
