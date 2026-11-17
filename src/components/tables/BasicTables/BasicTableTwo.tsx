import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge";
import { TrashBinIcon } from "../../../icons";

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    initials: string;
    bgColor: string;
  };
  product: string;
  dealValue: string;
  closeDate: string;
  status: "Complete" | "Pending";
}

const tableData: Order[] = [
  {
    id: "DE124321",
    customer: {
      name: "John Doe",
      email: "johndeo@gmail.com",
      initials: "JD",
      bgColor: "bg-blue-500",
    },
    product: "Software License",
    dealValue: "$18,50.34",
    closeDate: "2024-06-15",
    status: "Complete",
  },
  {
    id: "DE124321",
    customer: {
      name: "Kierra Franci",
      email: "kierra@gmail.com",
      initials: "KF",
      bgColor: "bg-pink-500",
    },
    product: "Software License",
    dealValue: "$18,50.34",
    closeDate: "2024-06-15",
    status: "Complete",
  },
  {
    id: "DE124321",
    customer: {
      name: "Emerson Workman",
      email: "emerson@gmail.com",
      initials: "EW",
      bgColor: "bg-sky-500",
    },
    product: "Software License",
    dealValue: "$18,50.34",
    closeDate: "2024-06-15",
    status: "Pending",
  },
  {
    id: "DE124321",
    customer: {
      name: "Chance Philips",
      email: "chance@gmail.com",
      initials: "CP",
      bgColor: "bg-orange-500",
    },
    product: "Software License",
    dealValue: "$18,50.34",
    closeDate: "2024-06-15",
    status: "Complete",
  },
  {
    id: "DE124321",
    customer: {
      name: "Terry Geidt",
      email: "terry@gmail.com",
      initials: "TG",
      bgColor: "bg-green-500",
    },
    product: "Software License",
    dealValue: "$18,50.34",
    closeDate: "2024-06-15",
    status: "Complete",
  },
];

export default function BasicTableTwo() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = tableData.filter(
    (order) =>
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="p-4">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 dark:border-gray-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-gray-700">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Deal ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Customer
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Product/Service
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Deal Value
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Close Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.map((order, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {order.id}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ${order.customer.bgColor}`}
                      >
                        {order.customer.initials}
                      </div>
                      <div>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{order.customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {order.product}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {order.dealValue}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {order.closeDate}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      size="sm"
                      color={order.status === "Complete" ? "success" : "warning"}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                      <TrashBinIcon className="w-5 h-5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}