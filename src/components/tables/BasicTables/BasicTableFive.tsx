import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

interface Customer {
  id: number;
  name: string;
  country: string;
  city: string;
  phone: string;
  status: string;
}

const tableData: Customer[] = [
  {
    id: 1,
    name: "Lindsey Curtis",
    country: "USA",
    city: "New York",
    phone: "(123) 456-7890",
    status: "Active",
  },
  {
    id: 2,
    name: "Kaiya George",
    country: "Canada",
    city: "Toronto",
    phone: "(234) 567-8901",
    status: "Pending",
  },
  {
    id: 3,
    name: "Zain Geidt",
    country: "UK",
    city: "London",
    phone: "(345) 678-9012",
    status: "Active",
  },
  {
    id: 4,
    name: "Abram Schleifer",
    country: "Australia",
    city: "Sydney",
    phone: "(456) 789-0123",
    status: "Cancel",
  },
  {
    id: 5,
    name: "Carla George",
    country: "Germany",
    city: "Berlin",
    phone: "(567) 890-1234",
    status: "Active",
  },
];

export default function BasicTableFive() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Country
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                City
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Phone
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  {customer.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {customer.country}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {customer.city}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {customer.phone}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {customer.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
