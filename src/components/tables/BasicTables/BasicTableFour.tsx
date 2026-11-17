import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

interface Employee {
  id: number;
  name: string;
  department: string;
  email: string;
  phone: string;
  status: string;
}

const tableData: Employee[] = [
  {
    id: 1,
    name: "Lindsey Curtis",
    department: "Design",
    email: "lindsey.curtis@example.com",
    phone: "(123) 456-7890",
    status: "Active",
  },
  {
    id: 2,
    name: "Kaiya George",
    department: "Management",
    email: "kaiya.george@example.com",
    phone: "(234) 567-8901",
    status: "Pending",
  },
  {
    id: 3,
    name: "Zain Geidt",
    department: "Content",
    email: "zain.geidt@example.com",
    phone: "(345) 678-9012",
    status: "Active",
  },
  {
    id: 4,
    name: "Abram Schleifer",
    department: "Marketing",
    email: "abram.schleifer@example.com",
    phone: "(456) 789-0123",
    status: "Cancel",
  },
  {
    id: 5,
    name: "Carla George",
    department: "Development",
    email: "carla.george@example.com",
    phone: "(567) 890-1234",
    status: "Active",
  },
];

export default function BasicTableFour() {
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
                Department
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Email
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
            {tableData.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  {employee.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {employee.department}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {employee.email}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {employee.phone}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {employee.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
