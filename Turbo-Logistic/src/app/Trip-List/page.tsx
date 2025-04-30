"use client";

import { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react"; // Import useSession
import { useRouter } from "next/navigation"; // Import useRouter for redirection

type Customer = {
  customer_id: number;
  customer_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  preferred_language: string;
  goods_type: string;
  goods_weight_in_tons: number;
  goods_volume_in_cubic_meters: number;
  pickup_address: string;
  pickup_state: string;
  pickup_date_time: string; // Assuming this is a date string
  delivery_state: string;
  delivery_address: string;
  delivery_date_time: string; // Assuming this is a date string
  payment_method: string;
  pickup_pin: string;
  delivery_pin: string;
  created_at: string;
  updated_at: string;
  vehicle_id: number | null;
  customer_type: string;
  registration_number: string;
  total_amount: number;
  agency_id: number;
  agency_name: string;
  branch: string;
};

type Vehicle = {
  vehicle_id: number;
  registration_number: string;
  owner_name: string;
};

export default function CustomersPage() {
  const { data: session, status } = useSession(); // Get session and status
  const router = useRouter(); // Initialize useRouter

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState<number | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "date-wise">("today");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [ownerName, setOwnerName] = useState<string>("");

  useEffect(() => {
    if (session) {
      const roles = session.user?.roles;
      const preferredUsername = session.user?.preferred_username;
      const accessToken = session.access_token;

      console.log("User:", preferredUsername);
    }
  }, [session]);

  // Check if the user has the required role
  useEffect(() => {
    if (status === "loading") return; // Wait for session to load

    // Extract user roles from session
    const userRoles = session?.user?.roles || [];

    // Define allowed roles
    const allowedRoles = ["Turbo-Logistic-Management"];

    // Check if the user has at least one of the allowed roles
    const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

    // Redirect unauthorized users
    if (!hasAccess) {
      alert("You do not have permission to access this page.");
      router.push("/unauthorized"); // Redirect to unauthorized page
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, vehiclesRes] = await Promise.all([
          axios.get("http://localhost:5000/customers"),
          axios.get("http://localhost:5000/vehicles"),
        ]);
        // Sort customers by customer_id in ascending order
        const sortedCustomers = customersRes.data.sort(
          (a: Customer, b: Customer) => a.customer_id - b.customer_id
        );
        setCustomers(sortedCustomers);
        setVehicles(vehiclesRes.data);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get the current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split("T")[0];

  // Filter customers based on search query and date filter
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearchQuery = Object.values(customer).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pickupDate = new Date(customer.pickup_date_time).toISOString().split("T")[0];

    let matchesDateFilter = true;
    if (dateFilter === "today") {
      // Match customers whose pickup date is today
      matchesDateFilter = pickupDate === currentDate;
    } else if (dateFilter === "date-wise") {
      // Match customers whose pickup date matches the selected date
      matchesDateFilter = pickupDate === selectedDate;
    }

    return matchesSearchQuery && (dateFilter === "all" || matchesDateFilter);
  });

  const getAvailableRegistrationNumbers = () => {
    const usedRegistrationNumbers = new Set(
      customers.map((customer) => customer.registration_number)
    );
    return vehicles.filter(
      (vehicle) => !usedRegistrationNumbers.has(vehicle.registration_number)
    );
  };

  const toggleExpand = (customerId: number) => {
    setExpandedCustomerId(expandedCustomerId === customerId ? null : customerId);
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({ ...customer });
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!formData) return;

    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    if (name === "registration_number") {
      const selectedVehicle = vehicles.find((v) => v.registration_number === value);
      if (selectedVehicle) {
        updatedFormData.vehicle_id = selectedVehicle.vehicle_id;
      }
    }

    setFormData(updatedFormData);
  };

  useEffect(() => {
    if (formData?.registration_number) {
      const selectedVehicle = vehicles.find(
        (v) => v.registration_number === formData.registration_number
      );
      setOwnerName(selectedVehicle?.owner_name || "Not Available");
    }
  }, [formData?.registration_number, vehicles]);

  const handleUpdate = async () => {
    if (!formData) return;

    try {
      await axios.put(`http://localhost:5000/customers/${formData.customer_id}`, formData);
      alert("Customer updated successfully!");
      setEditingCustomer(null);
      // Sort customers again after updating
      setCustomers((prev) =>
        prev
          .map((c) => (c.customer_id === formData.customer_id ? formData : c))
          .sort((a, b) => a.customer_id - b.customer_id)
      );
    } catch (err) {
      console.error("Error updating customer:", err);
      alert("Failed to update customer. Please try again.");
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-4 flex justify-center">
      <div className="max-w-screen-lg w-full">
        {/* Date Filter Dropdown and Search Bar in the Same Line */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-2 sticky top-0 z-10">
          <label className="mr-2 text-black dark:text-white">Trip-Details</label>
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

          <input
            type="text"
            placeholder="Search by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white mt-2 md:mt-0"
          />
        </div>

        {/* Scrollable Table Container */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg shadow-md overflow-y-auto max-h-[calc(100vh-150px)]">
          {filteredCustomers.length === 0 ? (
            // Display message if no trips are found
            <div className="p-4 text-center text-gray-600 dark:text-gray-400">
              {dateFilter === "today" ? "No trips found today." : "No trips match the selected criteria."}
            </div>
          ) : (
            // Display the table if trips are found
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-[10px] md:text-xs text-black dark:text-white">
              {/* Sticky Table Header */}
              <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
                <tr>
                  <th className="border px-2 py-1 text-xs md:text-sm text-left">Customer ID</th>
                  <th className="border px-2 py-1 text-xs md:text-sm text-left">Name</th>
                  <th className="border px-2 py-1 text-xs md:text-sm text-left">Source</th>
                  <th className="border px-2 py-1 text-xs md:text-sm text-left">Start-Date</th>
                  <th className="border px-2 py-1 text-xs md:text-sm text-left">Destination</th>
                  <th className="border px-2 py-1 text-xs md:text-sm text-left">End-Date</th>
                  <th className="border px-2 py-1 text-xs md:text-sm text-left">Type</th>
                  <th className="border px-2 py-1 text-xs md:text-sm text-left">Vehicle No</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <>
                    <tr
                      key={customer.customer_id}
                      className="border hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td
                        className="border px-2 py-1 cursor-pointer"
                        onClick={() => toggleExpand(customer.customer_id)}
                      >
                        {customer.customer_id}
                      </td>
                      <td className="border px-2 py-1">{customer.customer_name}</td>
                      <td className="border px-2 py-1">{customer.pickup_state}</td>
                      <td className="border px-2 py-1">{customer.pickup_date_time?.split("T")[0]}</td>
                      <td className="border px-2 py-1">{customer.delivery_state}</td>
                      <td className="border px-2 py-1">{customer.delivery_date_time?.split("T")[0]}</td>
                      <td className="border px-2 py-1">{customer.customer_type}</td>
                      <td className="border px-2 py-1 flex justify-between items-center">
                        <span>{customer.registration_number}</span>
                        <Edit
                          size={14}
                          className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-500 dark:hover:text-blue-400"
                          onClick={() => handleEditClick(customer)}
                        />
                      </td>
                    </tr>
                    {expandedCustomerId === customer.customer_id && (
                      <tr>
                        <td colSpan={8} className="border px-2 py-1 bg-gray-50 dark:bg-gray-700">
                          <div className="p-2">
                            <p><strong>Agency ID:</strong> {customer.agency_id}</p>
                            <p><strong>Agency Name:</strong> {customer.agency_name}</p>
                            <p><strong>Branch:</strong> {customer.branch}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {editingCustomer && formData && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-96">
              <h2 className="text-lg font-semibold mb-2 text-black dark:text-white">
                Edit Trip-Details
              </h2>
              <p className="text-black dark:text-white">
                <strong>Customer ID:</strong> {editingCustomer.customer_id}
              </p>
              <p className="text-black dark:text-white">
                <strong>Vehicle ID:</strong> {formData.vehicle_id ?? "Not Assigned"}
              </p>

              {/* Owner Name */}
              <p className="text-black dark:text-white">
                <strong>Owner Name:</strong> {ownerName}
              </p>

              <label className="block text-sm font-medium mt-2 text-black dark:text-white">
                Registration Number:
              </label>
              <select
                name="registration_number"
                value={formData.registration_number}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
              >
                <option value="" disabled>Select a vehicle</option>
                {getAvailableRegistrationNumbers().map((vehicle) => (
                  <option key={vehicle.vehicle_id} value={vehicle.registration_number}>
                    {vehicle.registration_number}
                  </option>
                ))}
              </select>

              <div className="mt-4 flex justify-end">
                {/* Save Button */}
                <button
                  className={`px-4 py-2 text-white rounded-md mr-2 ${
                    // Enable the button only if the pickup date is today
                    new Date(editingCustomer.pickup_date_time).toISOString().split("T")[0] ===
                    new Date().toISOString().split("T")[0]
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handleUpdate}
                  disabled={
                    // Disable the button if the pickup date is not today
                    new Date(editingCustomer.pickup_date_time).toISOString().split("T")[0] !==
                    new Date().toISOString().split("T")[0]
                  }
                >
                  Save
                </button>

                {/* Cancel Button */}
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                  onClick={() => setEditingCustomer(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}