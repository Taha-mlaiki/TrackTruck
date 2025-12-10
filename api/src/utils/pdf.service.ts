import PDFDocument from "pdfkit";
import getStream from "get-stream";

export class PdfService {
  async generateTripPdfBuffer(trip: any): Promise<Buffer> {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.fontSize(20).text("Trip Mission Order", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Reference: ${trip.reference || trip._id}`);
    doc.text(`Driver: ${trip.driver?.name ?? trip.driver}`);
    doc.text(`Truck: ${trip.truck?.plateNumber ?? trip.truck}`);
    doc.text(`From: ${trip.origin}  To: ${trip.destination}`);
    doc.text(`Planned Start: ${trip.plannedStart}`);
    doc.moveDown();

    doc.text("Fields to fill:");
    doc.text("- Start odometer: ______________________");
    doc.text("- End odometer: ________________________");
    doc.text("- Fuel consumed (L): ___________________");
    doc.moveDown();

    doc.text("Remarks:");
    doc.text("__________________________________________");
    doc.moveDown(2);

    doc.text("Signature: __________________________", { align: "right" });

    doc.end();
    const stream = await getStream(doc as any);
    return Buffer.from(stream);
  }
}
