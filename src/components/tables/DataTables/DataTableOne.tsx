import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

interface User {
  id: number;
  name: string;
  avatar: string;
  position: string;
  office: string;
  age: number;
  startDate: string;
  salary: string;
}

const tableData: User[] = [
  {
    id: 1,
    name: "Abram Schleifer",
    avatar: "/images/user/owner.jpg",
    position: "Sales Assistant",
    office: "Edinburgh",
    age: 57,
    startDate: "25 Apr, 2027",
    salary: "$89,500",
  },
  {
    id: 2,
    name: "Carla George",
    avatar: "/images/user/user-01.jpg",
    position: "Sales Assistant",
    office: "London",
    age: 45,
    startDate: "11 May, 2027",
    salary: "$15,500",
  },
  {
    id: 3,
    name: "Ekstrom Bothman",
    avatar: "/images/user/user-02.jpg",
    position: "Sales Assistant",
    office: "San Francisco",
    age: 53,
    startDate: "15 Nov, 2027",
    salary: "$19,200",
  },
];

export default function DataTableOne() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = tableData.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.office.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <div>
            <label htmlFor="entries" className="text-gray-700 dark:text-gray-300">
              Show{" "}
              <select
                id="entries"
                className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-1 px-2"
                defaultValue="10"
              >
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>{" "}
              entries
            </label>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 dark:border-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
              ></path>
            </svg>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-gray-700">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Position
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Office
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Age
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Start date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Salary
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="font-semibold">{user.name}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {user.position}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {user.office}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {user.age}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {user.startDate}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {user.salary}
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
