import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PageMeta from "../components/common/PageMeta";

interface Product {
  product: string;
  quantity: number;
  unitCost: number;
}

interface InvoiceData {
  id: number;
  name: string;
  address: string;
  issuedOn: string;
  toName: string;
  toAddress: string;
  dueOn: string;
  products: Product[];
  image: string;
}

const invoicesData: InvoiceData[] = [
  {
    id: 348,
    name: "Zain Geldt",
    address: "1280, Clair Street, Massachusetts, New York - 02543",
    issuedOn: "11 March, 2027",
    toName: "Albert Ward",
    toAddress: "355, Shobe Lane, Colorado, Fort Collins - 80543",
    dueOn: "16 March, 2027",
    products: [
      { product: "TailGrids", quantity: 1, unitCost: 48 },
      { product: "GreyGrids", quantity: 4, unitCost: 300 },
      { product: "Uideck", quantity: 2, unitCost: 800 },
      { product: "FormBold", quantity: 2, unitCost: 125 },
    ],
    image: "/images/user/user-01.jpg"
  },
  {
    id: 982,
    name: "Carla George",
    address: "1234, Elm Street, California, Los Angeles - 90001",
    issuedOn: "5 April, 2027",
    toName: "John Doe",
    toAddress: "789, Pine Lane, Texas, Dallas - 75001",
    dueOn: "20 April, 2027",
    products: [
      { product: "Product A", quantity: 3, unitCost: 100 },
      { product: "Product B", quantity: 2, unitCost: 150 },
    ],
    image: "/images/user/user-02.jpg"
  },
  {
    id: 289,
    name: "Abram Schleifer",
    address: "5678, Oak Street, Florida, Miami - 33101",
    issuedOn: "10 May, 2027",
    toName: "Jane Smith",
    toAddress: "456, Maple Lane, New York, Albany - 12201",
    dueOn: "25 May, 2027",
    products: [
      { product: "Product X", quantity: 5, unitCost: 200 },
      { product: "Product Y", quantity: 1, unitCost: 500 },
    ],
    image: "/images/user/user-03.jpg"
  },
  {
    id: 522,
    name: "Lincoln Donin",
    address: "9101, Birch Street, Illinois, Chicago - 60601",
    issuedOn: "15 June, 2027",
    toName: "Alice Johnson",
    toAddress: "321, Cedar Lane, Washington, Seattle - 98101",
    dueOn: "30 June, 2027",
    products: [
      { product: "Product M", quantity: 2, unitCost: 250 },
      { product: "Product N", quantity: 3, unitCost: 175 },
    ],
    image: "/images/user/user-01.jpg"
  }
];

const Invoice: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoicesData[0].id);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const filteredInvoices = invoicesData.filter((invoice) =>
    invoice.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedInvoice = invoicesData.find(
    (invoice) => invoice.id === selectedInvoiceId
  );

  if (!selectedInvoice) return <div className="p-6 text-red-500">Invoice not found</div>;

  const subTotal = selectedInvoice.products.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );
  const vat = subTotal * 0.1;
  const total = subTotal + vat;

  const printOptions = {
    content: () => invoiceRef.current,
    pageStyle: `
      @page {
        size: auto;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
        button {
          display: none !important;
        }
      }
    `,
  };

  const handlePrint = useReactToPrint(printOptions as any);

   const handleProceedToPayment = () => {
    // Add your payment processing logic here
    console.log('Proceeding to payment for invoice:', selectedInvoice.id);
    alert(`Proceeding to payment for invoice #${selectedInvoice.id}`);
  };

  const handleSaveAsPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice_${selectedInvoice.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <>
      <PageMeta
        title="Invoice Management"
        description="View and manage your invoices"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6 p-4 md:p-6">
        {/* Left Sidebar - Invoice List */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Invoices
            </h2>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search Invoice..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="max-h-[calc(100vh-220px)] space-y-3 overflow-y-auto">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors ${
                    invoice.id === selectedInvoiceId
                      ? "bg-blue-100 dark:bg-blue-900/50"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedInvoiceId(invoice.id)}
                >
                  <div className="h-10 w-10 overflow-hidden rounded-full">
                    <img
                      src={invoice.image}
                      alt={invoice.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {invoice.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ID: #{invoice.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Invoice Details */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9">
          <div 
            ref={invoiceRef}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Invoice Details
              </h2>
              <div className="mt-4 flex items-center gap-2 md:mt-0">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  ID: #{selectedInvoice.id}
                </span>
                <button 
                  onClick={handlePrint}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Print
                </button>
                <button 
                  onClick={handleSaveAsPDF}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                >
                  Save as PDF
                </button>
              </div>
            </div>

            {/* From/To Section */}
            <div className="mb-6 grid gap-6 border-b border-gray-200 pb-6 dark:border-gray-700 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                  From
                </h3>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full">
                    <img
                      src={selectedInvoice.image}
                      alt={selectedInvoice.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white">{selectedInvoice.name}</p>
                    <p className="text-gray-500 dark:text-gray-400">{selectedInvoice.address}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Issued On:</span> {selectedInvoice.issuedOn}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                  To
                </h3>
                <p className="text-gray-900 dark:text-white">{selectedInvoice.toName}</p>
                <p className="text-gray-500 dark:text-gray-400">{selectedInvoice.toAddress}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Due On:</span> {selectedInvoice.dueOn}
                </p>
              </div>
            </div>

            {/* Products Table */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      #
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Unit Cost
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.products.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">{item.product}</td>
                      <td className="px-6 py-4">{item.quantity}</td>
                      <td className="px-6 py-4">${item.unitCost.toLocaleString()}</td>
                      <td className="px-6 py-4 font-medium">
                        ${(item.quantity * item.unitCost).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex flex-col items-end space-y-2">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">
                    ${subTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">VAT (10%):</span>
                  <span className="text-gray-900 dark:text-white">
                    ${vat.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
             {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-3 no-print">
              <button 
                onClick={handlePrint}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
              >
                Print
              </button>
              <button 
                onClick={handleSaveAsPDF}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
              >
                Save as PDF
              </button>
              <button 
                onClick={handleProceedToPayment}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Proceed to payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Invoice;