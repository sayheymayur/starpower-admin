import React, { useState } from "react";
import CountryMap from "../ecommerce/CountryMap";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";

const countries = [
  {
    name: "USA",
    customers: 2379,
    percentage: 79,
    flag: "/images/country/country-01.svg",
  },
  {
    name: "France",
    customers: 589,
    percentage: 23,
    flag: "/images/country/country-02.svg",
  },
];

const CustomersDemographic: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-gray-900 dark:border-gray-800 dark:bg-gray-800 dark:text-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Customers Demographic</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Number of customer based on country
          </p>
        </div>
        <div className="relative inline-block">
          <button
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleDropdown}
          >
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Map placeholder replaced with CountryMap */}
      <div className="mb-6 rounded-lg bg-gray-100 dark:bg-gray-900 h-40 flex items-center justify-center">
        <CountryMap mapColor={undefined} />
      </div>

      {/* Country stats */}
      <div className="space-y-4">
        {countries.map(({ name, customers, percentage, flag }) => (
          <div key={name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={flag}
                alt={`${name} flag`}
                className="h-8 w-8 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white/90">{name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {customers.toLocaleString()} Customers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-1/3">
              <div className="h-2 w-full rounded-full bg-gray-300 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-blue-600 dark:bg-blue-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white/90">
                {percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomersDemographic;
