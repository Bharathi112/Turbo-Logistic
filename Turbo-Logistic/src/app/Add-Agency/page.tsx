"use client";

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useSession } from "next-auth/react"; // Import useSession
import { useRouter } from "next/navigation"; // Import useRouter for redirection

interface Agency {
  agency_id: number;
  agency_name: string;
  manager_name: string;
  contact_person: string;
  phone_number: string;
  alternate_phone: string;
  email: string;
  website_url: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  registration_number: string;
  gst_number: string;
  pan_number: string;
  bank_name: string;
  bank_account_number: string;
  ifsc_code: string;
  status: string;
  location: string;
  agent_username: string; // Changed username to agent_username
  branch: string; // Add branch field
}

interface FormState extends Omit<Agency, "agency_id"> {}

export default function Agencies() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]); // For search results
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { data: session, status } = useSession(); // Get session and status
  const router = useRouter(); // Initialize useRouter

  const [form, setForm] = useState<FormState>({
    agency_name: "",
    manager_name: "",
    contact_person: "",
    phone_number: "",
    alternate_phone: "",
    email: "",
    website_url: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    registration_number: "",
    gst_number: "",
    pan_number: "",
    bank_name: "",
    bank_account_number: "",
    ifsc_code: "",
    status: "Active",
    location: "",
    agent_username: "", // Initialize agent_username as empty
    branch: "", // Initialize branch as empty
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [view, setView] = useState<"none" | "add" | "list">("list"); // Set default view to "list"
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(""); // For search input

  useEffect(() => {
    if (session) {
      const preferredUsername = session.user?.preferred_username;

      // Set the agent_username in the form state
      setForm((prevForm) => ({
        ...prevForm,
        agent_username: preferredUsername || "Unknown",
      }));

      // Fetch agencies based on the agent_username
      fetchAgenciesByAgentUsername(preferredUsername);
    }
  }, [session]);

  // Fetch agencies based on agent_username
  const fetchAgenciesByAgentUsername = async (agentUsername: string | undefined) => {
    if (!agentUsername) return;

    try {
      const response = await axios.get(`http://localhost:5000/agency`);
      setAgencies(response.data);
      setFilteredAgencies(response.data); // Display agencies for the logged-in agent
      console.log("Agencies fetched:", response.data);
    } catch (error) {
      console.error("Error fetching agencies:", error);
      alert("Failed to fetch agencies. Please try again later.");
    }
  };

  // Handle changes to form inputs (text and textarea)
  const handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // Handle search by name or ID
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim().toLowerCase();
    setSearchQuery(e.target.value);

    if (!query) {
      setFilteredAgencies(agencies); // Reset to full list when input is cleared
    }
  };

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      const results = agencies.filter(
        (agency) =>
          agency.agency_name.toLowerCase().includes(query) || // Search by agency_name
          agency.agency_id.toString().includes(query) || // Search by ID
          agency.email.toLowerCase().includes(query) || // Search by email
          agency.phone_number.includes(query) // Search by phone_number
      );
      setFilteredAgencies(results); // Display search results
    } else {
      setFilteredAgencies(agencies); // Reset to full list if search is empty
    }
  };

  // Handle form submission (add/edit agency)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (form.agent_username === "Unknown") {
      alert("Agent username is unknown. Please ensure you are logged in.");
      return;
    }

    try {
      console.log("Sending PUT request with data:", form); // Log request data before sending

  if (editingId) {
    const response = await axios.put(`http://localhost:5000/agency/${editingId}`, form);
    console.log("PUT Response Data:", response.data); // Log response data
    setEditingId(null);
  } else {
    const response = await axios.post("http://localhost:5000/agency", form);
    console.log("POST Response Data:", response.data); // Log response data
  }
      setForm({
        agency_name: "",
        manager_name: "",
        contact_person: "",
        phone_number: "",
        alternate_phone: "",
        email: "",
        website_url: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
        registration_number: "",
        gst_number: "",
        pan_number: "",
        bank_name: "",
        bank_account_number: "",
        ifsc_code: "",
        status: "Active",
        location: "",
        agent_username: session?.user?.preferred_username || "Unknown", // Reset agent_username
        branch: "", // Reset branch
      });
      setSuccessMessage("Form submitted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchAgenciesByAgentUsername(session?.user?.preferred_username); // Refresh the list after submission
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form. Please try again.");
    }
  };

  // Handle edit agency
  const handleEdit = (agency: Agency) => {
    setForm({ ...agency });
    setEditingId(agency.agency_id);
    setView("add");
  };

  // Handle delete agency
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/agency/${id}`);
      fetchAgenciesByAgentUsername(session?.user?.preferred_username); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting agency:", error);
      alert("Failed to delete agency. Please try again.");
    }
  };

  // Handle full details view
  const handleFullDetails = (agency: Agency) => {
    setSelectedAgency(agency);
  };

  // Close full details modal
  const closeFullDetails = () => {
    setSelectedAgency(null);
  };

  return (
    <div className="container mx-auto p-4">
      {successMessage && (
        <div className="bg-green-500 text-white p-4 rounded-md mb-4">
          {successMessage}
        </div>
      )}

      {/* View Selection */}
      <div className="flex justify-center items-center space-x-4 mb-6">
        {session?.user?.roles.includes("Turbo-Logistic-Management") && (
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="view"
              value="list"
              checked={view === "list"}
              onChange={() => setView("list")}
              className="form-radio"
            />
            <span>Agencies List</span>
          </label>
        )}
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="view"
            value="add"
            checked={view === "add"}
            onChange={() => {
              setView("add");
              setEditingId(null);
              setForm({
                agency_name: "",
                manager_name: "",
                contact_person: "",
                phone_number: "",
                alternate_phone: "",
                email: "",
                website_url: "",
                address: "",
                city: "",
                state: "",
                country: "",
                postal_code: "",
                registration_number: "",
                gst_number: "",
                pan_number: "",
                bank_name: "",
                bank_account_number: "",
                ifsc_code: "",
                status: "Active",
                location: "",
                agent_username: session?.user?.preferred_username || "Unknown", // Reset agent_username
                branch: "", // Reset branch
              });
            }}
            className="form-radio"
          />
          <span>Add Agency</span>
        </label>
      </div>

      {/* Add Agency Form */}
      {view === "add" && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-transparent p-2 rounded-lg shadow-md">
          {/* Agent Username Field */}
          <div className="hidden">
            <label className="font-medium">Agent Username</label>
            <input
              type="text"
              name="agent_username"
              value={form.agent_username}
              onChange={(e) => setForm({ ...form, agent_username: e.target.value })} // Allow manual input
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
            />
          </div>

          {/* Other Form Fields */}
{[
    { label: "Agent Username", name: "agent_username", required: true }, // Added agent_username field
  { label: "Agency Name", name: "agency_name", required: true },
  { label: "Manager Name", name: "manager_name", required: true },
  { label: "Contact Person", name: "contact_person", required: true },
  { label: "Phone Number", name: "phone_number", required: true },
  { label: "Alternate Phone", name: "alternate_phone", required: false },
  { label: "Email", name: "email", required: true },
  { label: "Website URL", name: "website_url", required: false },
  { label: "Address", name: "address", required: true },
  { label: "City", name: "city", required: true },
  { label: "State", name: "state", required: true },
  { label: "Country", name: "country", required: true },
  { label: "Postal Code", name: "postal_code", required: true },
  { label: "Registration Number", name: "registration_number", required: true },
  { label: "GST Number", name: "gst_number", required: true },
  { label: "PAN Number", name: "pan_number", required: true },
  { label: "Bank Name", name: "bank_name", required: true },
  { label: "Bank Account Number", name: "bank_account_number", required: true },
  { label: "IFSC Code", name: "ifsc_code", required: true },
  { label: "Status", name: "status", required: true },
  { label: "Location", name: "location", required: true },
  { label: "Branch", name: "branch", required: true },
].map((field) => (
  <div key={field.name} className="flex flex-col space-y-2">
    <label className="font-medium">
      {field.label} {field.required && <span className="text-red-500">*</span>}
    </label>
    <input
      name={field.name}
      placeholder={field.label}
      value={form[field.name as keyof FormState] as string}
      onChange={handleChange}
      required={field.required}
      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
))}


          {/* Submit Button */}
          <button
            type="submit"
            className="col-span-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
          >
            {editingId ? "Update Agency" : "Add Agency"}
          </button>
        </form>
      )}

      {/* Agencies List */}
      {view === "list" && (
        <div className="mt-8 px-2 sm:px-4 lg:px-8">
          {/* Search Bar */}
          <div className="mb-6 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search by Agency Name, Email, or Phone Number"
              value={searchQuery}
              onChange={handleSearchChange}
              className="p-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md bg-gray-800 text-white"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Search
            </button>
          </div>

          <div className="w-full overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto border border-gray-300 rounded-lg">
              <table className="w-full text-[10px] md:text-xs text-black dark:text-white border-collapse">
                <thead className="bg-gray-200 dark:bg-gray-800 sticky top-0 z-10 shadow-md">
                  <tr className="text-[10px] md:text-xs font-bold border-b border-gray-400">
                    <th className="border border-gray-300 p-2 text-left">ID</th>
                    <th className="border border-gray-300 p-2 text-left">Agency Name</th>
                    <th className="border border-gray-300 p-2 text-left">Contact Person</th>
                    <th className="border border-gray-300 p-2 text-left">Phone Number</th>
                    <th className="border border-gray-300 p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgencies.length > 0 ? (
                    filteredAgencies.map((agency, index) => (
                      <tr
                        key={agency.agency_id}
                        className={`${
                          index % 2 === 0 ? "bg-white dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-900"
                        } hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-200`}
                      >
                        <td className="border border-gray-300 p-2 text-left">{agency.agency_id}</td>
                        <td className="border border-gray-300 p-2 text-left">{agency.agency_name}</td>
                        <td className="border border-gray-300 p-2 text-left">{agency.contact_person}</td>
                        <td className="border border-gray-300 p-2 text-left">{agency.phone_number}</td>
                        <td className="border border-gray-300 p-2 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(agency)}
                            aria-label="Edit agency"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition duration-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(agency.agency_id)}
                            aria-label="Delete agency"
                            className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition duration-300"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleFullDetails(agency)}
                            aria-label="View full details"
                            className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 transition duration-300"
                          >
                            Full Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-2 text-center text-gray-500 dark:text-gray-400">
                        No agencies found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Full Details Modal */}
      {selectedAgency && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Full Details
      </h2>
      {/* Add a scrollable container with a fixed height */}
      <div className="max-h-[70vh] overflow-y-auto space-y-4 text-gray-800 dark:text-gray-300">
        <p><strong>Agency Name:</strong> {selectedAgency.agency_name}</p>
        <p><strong>Manager Name:</strong> {selectedAgency.manager_name}</p>
        <p><strong>Contact Person:</strong> {selectedAgency.contact_person}</p>
        <p><strong>Phone Number:</strong> {selectedAgency.phone_number}</p>
        <p><strong>Alternate Phone:</strong> {selectedAgency.alternate_phone || "N/A"}</p>
        <p><strong>Email:</strong> {selectedAgency.email}</p>
        <p><strong>Website URL:</strong> {selectedAgency.website_url || "N/A"}</p>
        <p><strong>Address:</strong> {selectedAgency.address}</p>
        <p><strong>City:</strong> {selectedAgency.city}</p>
        <p><strong>State:</strong> {selectedAgency.state}</p>
        <p><strong>Country:</strong> {selectedAgency.country}</p>
        <p><strong>Postal Code:</strong> {selectedAgency.postal_code}</p>
        <p><strong>Registration Number:</strong> {selectedAgency.registration_number}</p>
        <p><strong>GST Number:</strong> {selectedAgency.gst_number}</p>
        <p><strong>PAN Number:</strong> {selectedAgency.pan_number}</p>
        <p><strong>Bank Name:</strong> {selectedAgency.bank_name}</p>
        <p><strong>Bank Account Number:</strong> {selectedAgency.bank_account_number}</p>
        <p><strong>IFSC Code:</strong> {selectedAgency.ifsc_code}</p>
        <p><strong>Status:</strong> {selectedAgency.status}</p>
        <p><strong>Location:</strong> {selectedAgency.location}</p>
        <p><strong>Branch:</strong> {selectedAgency.branch}</p>
        <p><strong>Agent Username:</strong> {selectedAgency.agent_username}</p>
      </div>
      <button
        onClick={closeFullDetails}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
      >
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
}