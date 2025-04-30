"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Edit, Search } from "lucide-react";

const AgencyUI = () => {
  interface Customer {
    customer_id: string;
    customer_name: string;
    pickup_state: string;
    delivery_state: string;
    pickup_address: string;
    delivery_address: string;
    vehicle_id: string;
    pickup_date_time: string;
    delivery_date_time: string;
    agent_username: string;
    agency_id: string;
    agency_name: string;
    branch: string;
    registration_number: string;
  }

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "date-wise">("today");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  const preferredUsername = session?.user?.name || "";
  const access_token = session?.access_token;

  useEffect(() => {
    if (status !== "authenticated" || !preferredUsername || !access_token) return;

    const fetchCustomersByAgentUsername = async () => {
      try {
        setError("");
        const response = await axios.get(
          `http://localhost:5000/customers/agent/${preferredUsername}`,
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

    fetchCustomersByAgentUsername();
  }, [preferredUsername, access_token, status]);

  const editCustomer = (customerId: string) => {
    const customer = customers.find((c) => c.customer_id === customerId);
    if (customer) {
      // Format dates for datetime-local input
      const formattedCustomer = {
        ...customer,
        pickup_date_time: formatDateForDatetimeLocal(customer.pickup_date_time),
        delivery_date_time: formatDateForDatetimeLocal(customer.delivery_date_time)
      };
      setSelectedCustomer(formattedCustomer);
      setIsEditModalOpen(true);
    }
  };

  // Format date strings for datetime-local input
  const formatDateForDatetimeLocal = (dateString: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Invalid date
    
    // Format as YYYY-MM-DDThh:mm
    return date.toISOString().slice(0, 16);
  };

  const handleSave = async (updatedCustomer: Customer) => {
    try {
      // Show loading state or spinner here if needed
      
      const response = await axios.put(
        `http://localhost:5000/customers/${updatedCustomer.customer_id}`,
        updatedCustomer,
        {
          headers: { 
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      if (response.status === 200) {
        // Update the local state with the updated customer data
        setCustomers(prevCustomers => 
          prevCustomers.map(customer => 
            customer.customer_id === updatedCustomer.customer_id ? updatedCustomer : customer
          )
        );
        
        // Close the modal
        setIsEditModalOpen(false);
        
        // Optional: Show success message
        console.log("Customer updated successfully:", response.data);
      }
    } catch (err) {
      console.error("Error updating customer:", err);
      // Optional: Show error message to user
      setError("Failed to update customer");
    }
  };

  const searchCustomers = (customers: Customer[], query: string) => {
    if (!query.trim()) return customers;
    
    const searchTerm = query.toLowerCase().trim();
    return customers.filter(customer => 
      String(customer.customer_id).toLowerCase().includes(searchTerm) || // Convert to string
      customer.customer_name.toLowerCase().includes(searchTerm) ||
      customer.pickup_state.toLowerCase().includes(searchTerm) ||
      customer.delivery_state.toLowerCase().includes(searchTerm) 
      
    );
  };
  
  // Apply both date filter and search filter
  const filteredCustomers = searchCustomers(
    customers.filter((customer) => {
      const pickupDate = new Date(customer.pickup_date_time).toISOString().split("T")[0];
      const deliveryDate = new Date(customer.delivery_date_time).toISOString().split("T")[0];
      const currentDate = new Date().toISOString().split("T")[0];
  
      if (dateFilter === "today") {
        return pickupDate === currentDate;
      } else if (dateFilter === "date-wise") {
        return pickupDate === selectedDate || deliveryDate === selectedDate;
      } else {
        return true;
      }
    }),
    searchQuery
  );

  if (status === "loading") return <p>Loading session...</p>;
  if (status === "unauthenticated") return <p>Please sign in to view customer information.</p>;

  return (
    <div className="p-4 w-full flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">Booking-Info</h2>
      
      {/* Filters and Search Bar Row */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        {/* Date Filter */}
        <div className="flex flex-row items-center">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as "all" | "today" | "date-wise")}
            className="px-2 py-1 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
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
              className="ml-2 px-2 py-1 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
            />
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers..."
            className="pl-10 w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
          />
        </div>
      </div>
      
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {filteredCustomers.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <div className="max-h-80 overflow-y-auto border rounded-md shadow-md">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-700 text-white">
                <tr>
                  <th className="py-2 px-4 border-b text-center text-xs">Trip ID</th>
                  <th className="py-2 px-4 border-b text-center text-xs">Customer Name</th>
                  <th className="py-2 px-4 border-b text-center text-xs">Pickup State</th>
                  <th className="py-2 px-4 border-b text-center text-xs">Pickup Address</th>
                  <th className="border px-2 py-1 text-xs text-left">Start-Date</th>
                  <th className="py-2 px-4 border-b text-center text-xs">Delivery State</th>
                  <th className="py-2 px-4 border-b text-center text-xs">Delivery Address</th>
                  <th className="border px-2 py-1 text-xs text-left">End-Date</th>
                  <th className="py-2 px-4 border-b text-center text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.customer_id} className="hover:bg-gray-600 transition-colors">
                    <td className="py-2 px-4 border-b text-center text-xs">{customer.customer_id}-{customer.registration_number}</td>
                    <td className="py-2 px-4 border-b text-center text-xs">{customer.customer_name}</td>
                    <td className="py-2 px-4 border-b text-center text-xs">{customer.pickup_state}</td>
                    <td className="py-2 px-4 border-b text-center text-xs">{customer.pickup_address}</td>
                    <td className="border px-2 py-1 text-xs">{customer.pickup_date_time?.split("T")[0]}</td>
                    <td className="py-2 px-4 border-b text-center text-xs">{customer.delivery_state}</td>
                    <td className="py-2 px-4 border-b text-center text-xs">{customer.delivery_address}</td>
                    <td className="border px-2 py-1 text-xs">{customer.delivery_date_time?.split("T")[0]}</td>
                    <td className="py-2 px-4 border-b text-center text-xs">
                      <button onClick={() => editCustomer(customer.customer_id)}>
                        <Edit className="w-5 h-5 text-blue-500 hover:text-white" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !error && <p className="text-gray-500">No Trips found for the selected criteria.</p>
      )}

{isEditModalOpen && selectedCustomer && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white overflow-y-auto max-h-[500px] dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
      <h3 className="text-lg font-bold mb-4">Edit Customer</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(selectedCustomer);
        }}
      >
        <div className="space-y-4">
          {/* Form fields for editing customer details */}
          <div>
            <label className="block text-sm font-medium mb-1">Customer Name</label>
            <input
              type="text"
              name="customer_name"
              value={selectedCustomer.customer_name}
              onChange={(e) =>
                setSelectedCustomer({ ...selectedCustomer, customer_name: e.target.value })
              }
              className="w-full px-2 py-1 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pickup State</label>
            <input
              type="text"
              name="pickup_state"
              value={selectedCustomer.pickup_state}
              onChange={(e) =>
                setSelectedCustomer({ ...selectedCustomer, pickup_state: e.target.value })
              }
              className="w-full px-2 py-1 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pickup Address</label>
            <input
              type="text"
              name="pickup_address"
              value={selectedCustomer.pickup_address}
              onChange={(e) =>
                setSelectedCustomer({ ...selectedCustomer, pickup_address: e.target.value })
              }
              className="w-full px-2 py-1 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery State</label>
            <input
              type="text"
              name="delivery_state"
              value={selectedCustomer.delivery_state}
              onChange={(e) =>
                setSelectedCustomer({ ...selectedCustomer, delivery_state: e.target.value })
              }
              className="w-full px-2 py-1 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Address</label>
            <input
              type="text"
              name="delivery_address"
              value={selectedCustomer.delivery_address}
              onChange={(e) =>
                setSelectedCustomer({ ...selectedCustomer, delivery_address: e.target.value })
              }
              className="w-full px-2 py-1 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pickup Date</label>
            <input
              type="datetime-local"
              name="pickup_date_time"
              value={selectedCustomer.pickup_date_time}
              onChange={(e) =>
                setSelectedCustomer({ ...selectedCustomer, pickup_date_time: e.target.value })
              }
              className="w-full px-2 py-1 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Date</label>
            <input
              type="datetime-local"
              name="delivery_date_time"
              value={selectedCustomer.delivery_date_time}
              onChange={(e) =>
                setSelectedCustomer({ ...selectedCustomer, delivery_date_time: e.target.value })
              }
              className="w-full px-2 py-1 border rounded-md"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded-md ${
              // Enable the button only if the pickup date is today
              new Date(selectedCustomer.pickup_date_time).toISOString().split("T")[0] ===
              new Date().toISOString().split("T")[0]
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={
              // Disable the button if the pickup date is not today
              new Date(selectedCustomer.pickup_date_time).toISOString().split("T")[0] !==
              new Date().toISOString().split("T")[0]
            }
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default AgencyUI;