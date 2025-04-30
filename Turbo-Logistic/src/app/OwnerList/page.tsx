"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

const OwnersUI = () => {
  interface Customer {
    owner_id: string;
    customer_id: string;
    registration_number: string;
    owner_name: string;
    pickup_state: string;
    delivery_state: string;
    vehicle_id: string;
    pickup_date_time: string;
    delivery_date_time: string;
  }

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "date-wise">("today");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const preferredUsername = session?.user?.name || "";
  const access_token = session?.access_token;

  useEffect(() => {
    if (status !== "authenticated" || !preferredUsername || !access_token) return;

    const fetchCustomersByUsername = async () => {
      try {
        setError("");
        const response = await axios.get(
          `http://localhost:5000/customers/username/${preferredUsername}`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );
        setCustomers(response.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError("Customers not found");
        setCustomers([]);
      }
    };

    fetchCustomersByUsername();
  }, [preferredUsername, access_token, status]);

  const filteredCustomers = customers.filter((customer) => {
    const pickupDate = new Date(customer.pickup_date_time).toISOString().split("T")[0];
    const currentDate = new Date().toISOString().split("T")[0];

    // Date filter logic
    const matchesDateFilter =
      dateFilter === "today"
        ? pickupDate === currentDate // Filter for today's pickups
        : dateFilter === "date-wise"
        ? pickupDate === selectedDate // Filter for selected start date
        : true; // No date filter (show all)

    // Search filter logic
    const matchesSearch =
      String(customer.customer_id).includes(searchQuery) || 
      customer.pickup_state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.delivery_state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(customer.registration_number).includes(searchQuery);

    return matchesDateFilter && matchesSearch;
  });

  if (status === "loading") return <p>Loading session...</p>;
  if (status === "unauthenticated") return <p>Please sign in to view customer information.</p>;

  return (
    <div className="p-4 w-full flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">Trip-Informations List</h2>
      <div className="w-full flex flex-col md:flex-row items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
        />
        <div className="flex flex-col md:flex-row items-center">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as "all" | "today" | "date-wise")}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="date-wise">Date-wise</option>
          </select>
          {dateFilter === "date-wise" && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="ml-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
            />
          )}
        </div>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {filteredCustomers.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md shadow-md">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-700 text-white dark:bg-gray-800">
                <tr>
                  <th className="py-2 px-4 border-b text-center text-[10px] md:text-xs">Trip ID</th>
                  <th className="py-2 px-4 border-b text-center text-[10px] md:text-xs">Source</th>
                  <th className="border px-2 py-1 text-xs md:text-sm text-left">Start-Date</th>
                  <th className="py-2 px-4 border-b text-center text-[10px] md:text-xs">Destination</th>
                  <th className="border px-2 py-1 text-xs md:text-sm text-left">End-Date</th>
                  <th className="py-2 px-4 border-b text-center text-[10px] md:text-xs">Vehicle No</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.owner_id}
                    className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <td className="py-2 px-4 border-b text-center text-[10px] md:text-xs">{customer.customer_id}</td>
                    <td className="py-2 px-4 border-b text-center text-[10px] md:text-xs">{customer.pickup_state}</td>
                    <td className="border px-2 py-1">{customer.pickup_date_time?.split("T")[0]}</td>
                    <td className="py-2 px-4 border-b text-center text-[10px] md:text-xs">{customer.delivery_state}</td>
                    <td className="border px-2 py-1">{customer.delivery_date_time?.split("T")[0]}</td>
                    <td className="py-2 px-4 border-b text-center text-[10px] md:text-xs">{customer.registration_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !error && <p className="text-gray-500">No Trips found for the selected date.</p>
      )}
    </div>
  );
};

export default OwnersUI;