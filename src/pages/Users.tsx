import { useState, useEffect } from "react";
import { formatLocalDate } from "../utils/dateUtils";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import { TrashBinIcon, PencilIcon } from "../icons";
import { API_ORIGIN } from '../config/apiOrigin';

interface User {
  userId: number;
  name: string;
  phoneNumber: string;
  totalPosts: number;
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  cancelledSessions: number;
  state: string | null;
  lastOnline: string; // ISO date string
  lastRecharge: string | null; // ISO date string or null
  lastRechargeAmount: number | null;
  totalRechargeAmount: number;
  joinDate: string; // ISO date string
  isActive: boolean;
  profilePhoto: string | null;
  email: string | null;
  totalWalletBalance: number;
  totalSpent: number;
}

/*
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
*/

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<Array<User> | null>(null);

  const fetchData = () => {
    const token = authService.getToken();
    fetch(`${API_ORIGIN}/api/dashboard/api/userdata/getallusers`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).then(async (res) => {
      const json = await res.json();
      setTableData(json.data);
    });
  };
    const filteredData = tableData?.filter(
    (user: User) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchData();
  }, [])





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
                  <input type="checkbox" />
                </TableCell>
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
                  Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Total Posts
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Total Sessions
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  State
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Last Online
                </TableCell>
                                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Last Top-Up
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
              {!filteredData &&
              <div style={{color:'white', margin: 'auto'}}>
               <i> Loading data </i>
               </div>}
              {filteredData?.map((user) => (
                <TableRow
                  key={user.userId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"

                >
                                    <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    <input type="checkbox" />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm flex items-center gap-3">
                    <img
                      src={user.profilePhoto || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg' }
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-semibold">{user.name}</span>
                      <p className="text-xs text-gray-500">ID: {user.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {user.phoneNumber}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {user.totalPosts}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {user.totalSessions}|{user.completedSessions}|{user.failedSessions}|{user.cancelledSessions}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {user.state === null ? 'Maharashtra' : user.state}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {formatLocalDate(user.joinDate)}
                  </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {formatLocalDate(user.lastRecharge)}
                  </TableCell>
                  <TableCell className="px-4 py-3 flex gap-3 text-gray-400 dark:text-gray-300">
                    <button className="hover:text-gray-600 dark:hover:text-white">
                      <TrashBinIcon className="w-5 h-5" />
                    </button>
                    <button                  onClick={() => navigate(`/userdetails?userid=${user.userId}`)}
 className="hover:text-gray-600 dark:hover:text-white">
                      <PencilIcon className="w-5 h-5" />
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
