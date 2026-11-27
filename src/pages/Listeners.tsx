import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import Badge from "../components/ui/badge";
import { TrashBinIcon, PencilIcon, DownloadIcon } from "../icons";
import { dashboardAPI } from "../services/dashboardAPI";
import { API_ORIGIN, PUBLIC_URL_PREFIX_RE } from '../config/apiOrigin';

export interface Listener {
  userId: string;
  username: string;
  mobileNo: string;
  emailId: string | null;
  fullName: string;
  dob: string | null;
  gender: string | null;
  referralCode: string | null;
  profilePhoto: string | null;
  createdDateTime: string;
  status: boolean;
  ipAddress: string;
  bio: string | null;
  isAvatar: boolean;
  isBrandAmbassador: boolean;
  latitude: number | null;
  longitude: number | null;
  deviceId: string | null;
  referByUserId: string;
  deactivateDateTime: string | null;
  fcmToken: string;
  isDoctor: number;
  preferedLanguage: string | null;
  assessmentCerti: string | null;
  qualificationProof: string | null;
  perMinuteCost: number;
  commissionPer: number;
  rejectedRemark: string | null;
  mailSend: boolean;
  mailSendDateTime: string | null;
  doctorProfileStatus: number;
  appPlatform: string;
  panNo: string | null;
  topicIds: string | null;
  chatPerMinuteCost: number | null;
  chatCommissionPer: number | null;
  accountId: string | null;
  stakeholderId: string | null;
  testUser: string | null;
  isAiBot: number;
  kycStatus: number;
  state: {
    stateId: number;
    stateCode: string;
    stateName: string;
  } | null;
  referrer: {
    userId: string | null;
    name: string | null;
    phoneNumber: string | null;
  };
  statistics: {
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    totalSpent: number;
    totalEarned: number;
    walletBalance: number;
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
    totalActivities: number;
    lastLoginDate: string | null;
    lastActivityDate: string | null;
  };
}


/*
const tableData: Listener[] = [
  {
    id: 1,
    name: "Abram Schleifer",
    avatar: "/images/user/owner.jpg",
    email: "demoemail@gmail.com",
    position: "Software Engineer",
    salary: "$89,500",
    office: "Edinburgh",
    status: "Hired",
  },
  {
    id: 2,
    name: "Carla George",
        avatar: "/images/user/owner.jpg",

    email: "demoemail@gmail.com",
    position: "Integration Specialist",
    salary: "$15,500",
    office: "London",
    status: "Pending",
  },
  {
    id: 3,
    name: "Ekstrom Bothman",
        avatar: "/images/user/owner.jpg",

    email: "demoemail@gmail.com",
    position: "Software Engineer",
    salary: "$19,200",
    office: "San Francisco",
    status: "Hired",
  },
];
*/

export default function DataTableThree() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState<Array<Listener> | null>(null);

  const fetchData = async () => {
    try {
      const response = await dashboardAPI.getEnhancedListeners();
      if (response.success) {
        setTableData(response.data as Listener[]);
      } else {
        console.error('Failed to fetch enhanced listeners:', response.message);
      }
    } catch (error) {
      console.error('Error fetching enhanced listeners:', error);
    }
  }
  const filteredData = tableData?.filter(
    (user: Listener) =>
      user.userId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobileNo?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <button className="flex items-center gap-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600">
            <DownloadIcon className="w-5 h-5" />
            Download
          </button>
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
                  User ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Name
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
                  Documents
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Bank details
                </TableCell>
                                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Topics
                </TableCell>
                                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-start text-sm"
                >
                  Bio
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
                          {!filteredData &&
              <div style={{color:'white', margin: 'auto'}}>
               <i> Loading data </i>
               </div>}
              {filteredData && filteredData.map((user: Listener) => (
                <TableRow
                  key={user.userId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    <input type="checkbox" />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {user.userId}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm flex items-center gap-3">
                   <img
                      src={user.profilePhoto || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg' }
                      alt={user.fullName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-semibold">{user.fullName}</span>
                      <p className="text-xs text-gray-500">ID: {user.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {user.mobileNo}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm flex">
                    {user.assessmentCerti && 
                    <a className="items-center gap-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-600" href={`${API_ORIGIN}/public/${user.assessmentCerti.replace(PUBLIC_URL_PREFIX_RE, '')}`} target="_blank"> Assement </a>
                    }
                    
                     {user.qualificationProof && 
                    <a className="items-center gap-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-600" href={`${API_ORIGIN}/public/${user.qualificationProof.replace(PUBLIC_URL_PREFIX_RE, '')}`} target="_blank"> Qualification </a>
                    }
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {typeof user.state === 'string' ? user.state : user.state?.stateName || 'N/A'}
                  </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {user.topicIds || 'N/A'}
                  </TableCell>
                   <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                    {user.bio?.slice(0, 90)}{user.bio && user.bio?.length > 90 ? '..' : ''}
                  </TableCell>
                      <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm">
                           <Badge
                      size="sm"
                      color={user.status ? "success" : "warning"}
                    >
                      {user.status ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 flex gap-3 text-gray-400 dark:text-gray-300">
                    <button className="hover:text-gray-600 dark:hover:text-white">
                      <TrashBinIcon className="w-5 h-5" />
                    </button>
                    <button className="hover:text-gray-600 dark:hover:text-white">
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
