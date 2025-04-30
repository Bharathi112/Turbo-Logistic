"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash, FaEye, FaSave } from "react-icons/fa";

export default function Dashboard() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchCriteria, setSearchCriteria] = useState<string>("id");
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<any>({});
  const { data: session, status } = useSession();
  const router = useRouter();

  // Authentication and Role Check
  useEffect(() => {
    if (status === "loading") return;

    const userRoles = session?.user?.roles || [];
    const allowedRoles = ["Turbo-Logistic-Management"];
    const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasAccess) {
      alert("You do not have permission to access this page.");
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  // Fetch data when search criteria change
  useEffect(() => {
    if (selectedOption && searchQuery) {
      fetchData(selectedOption, searchQuery);
    } else {
      setData([]);
    }
  }, [selectedOption, searchQuery, searchCriteria]);

  // Fetch data from backend
  const fetchData = async (option: string, query: string) => {
    setLoading(true);
    setError(null);

    let url = "";
    switch (option) {
      case "option1":
        url = `http://localhost:5000/owners?${searchCriteria}=${query}`;
        break;
      case "option2":
        url = `http://localhost:5000/customers?${searchCriteria}=${query}`;
        break;
      case "option3":
        url = `http://localhost:5000/agency?${searchCriteria}=${query}`;
        break;
      default:
        return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      setData(Array.isArray(result) ? result : [result]);
    } catch (error) {
      console.error(`Error fetching ${option}:`, error);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value === "") {
      setData([]);
    }
  };

  // Enable edit mode for a specific row
  const handleEdit = (id: string) => {
    setEditMode(id);
    const rowData = data.find((item) => item.owner_id === id);
    setEditedData(rowData);
  };

  // Handle input changes in edit mode
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setEditedData({
      ...editedData,
      [field]: e.target.value,
    });
  };

  // Handle file upload for ID Proof
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditedData({
      ...editedData,
      id_proof: file,
    });
  };

  // Save changes when Enter is pressed
  const handleSave = async (id: string) => {
    try {
      let response;
      if (editedData.id_proof instanceof File) {
        const formData = new FormData();
        formData.append("id_proof", editedData.id_proof);
        Object.keys(editedData).forEach((key) => {
          if (key !== "id_proof") {
            formData.append(key, editedData[key]);
          }
        });

        response = await fetch(`http://localhost:5000/owners/${id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        response = await fetch(`http://localhost:5000/owners/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedData),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to update data");
      }

      const updatedOwner = await response.json();
      setData((prevData) =>
        prevData.map((item) =>
          item.owner_id === id ? { ...item, ...updatedOwner } : item
        )
      );

      setEditMode(null);
      console.log("Data updated successfully");
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleSave(id);
    }
  };

  // Handle Delete Action
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/owners/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete data");
      }

      setData((prevData) => prevData.filter((item) => item.owner_id !== id));
      console.log("Data deleted successfully");
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  // Handle View Action
  const handleView = (id: string) => {
    console.log("View item with ID:", id);
    // Add your view logic here
  };

  // Client-side filtering (optional fallback)
  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    
    const searchValue = searchQuery.toLowerCase();
    
    switch(searchCriteria) {
      case 'email':
        return item.email?.toLowerCase().includes(searchValue); // Changed from 'name' to 'email'
      case 'contact_number':
        return item.contact_number?.toLowerCase().includes(searchValue);
      case 'id':
      default:
        return item.owner_id?.toString().toLowerCase().includes(searchValue);
    }
  });

  return (
    <div className="flex flex-col items-center justify-start min-h-200 p-6 overflow-hidden">
      <div className="p-6 shadow-lg rounded-lg w-full max-w-6xl overflow-y-auto">
        {/* Radio Buttons and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl space-y-4 md:space-y-0">
  {/* Radio Buttons (Responsive) */}
  
  <div className="flex flex-col space-y-2 w-full">
  <h2 className="text-lg font-bold">Search ID:</h2>
  <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0">
    {[
      { value: "option1", label: "Owners" },
      { value: "option2", label: "Trips" },
      { value: "option3", label: "Agencies" },
      { value: "option4", label: "Vehicles" },
    ].map((opt, index) => (
      <label key={index} className="flex items-center space-x-2 cursor-pointer">
        <input
          type="radio"
          name="searchOptions"
          value={opt.value}
          className="w-4 h-4"
          onChange={() => {
            setSelectedOption(opt.value);
            setData([]);
            setShowSearch(true);
          }}
        />
        <span>{opt.label}</span>
      </label>
    ))}
  </div>
</div>

  {/* Search Bar (Responsive) */}
{showSearch && (
  <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto md:ml-12">
    <select
      className="p-2 border rounded w-full md:w-auto"
      onChange={(e) => setSearchCriteria(e.target.value)}
      value={searchCriteria}
    >
      <option value="id">Search by ID</option>
      <option value="email">Search by Email</option>
      <option value="contact_number">Search by Contact Number</option>
    </select>
    <input
      type="text"
      placeholder={`Enter ${
        searchCriteria === "email"
          ? "email"
          : searchCriteria === "contact_number"
          ? "contact number"
          : "ID"
      }`}
      className="p-2 border border-white rounded w-full md:w-auto"
      value={searchQuery}
      onChange={handleSearchChange}
    />
  </div>
)}

</div>


        {/* Fetching Status */}
        {loading && <p className="mt-4 text-blue-500">Loading data...</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}

        {/* Display Filtered Data */}
        {filteredData.length > 0 && searchQuery && (
  <div className="mt-4 border p-3 rounded-lg max-h-80 overflow-y-auto w-full">
    <table className="w-full border-collapse border border-gray-300 text-sm">
      <thead>
        <tr className="bg-gray-600 text-white">
          <th className="border border-gray-300 p-2">Owner ID</th>
          <th className="border border-gray-300 p-2">Name</th>
          <th className="border border-gray-300 p-2">Contact</th>
          <th className="border border-gray-300 p-2">Email</th>
          <th className="border border-gray-300 p-2">Address</th>
          <th className="border border-gray-300 p-2">City</th>
          <th className="border border-gray-300 p-2">State</th>
          <th className="border border-gray-300 p-2">Zipcode</th>
          <th className="border border-gray-300 p-2">ID Proof</th>
          <th className="border border-gray-300 p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((owner: any) => (
          <tr key={owner.owner_id} className="text-center hover:bg-gray-800">
            <td className="border border-gray-300 p-2">{owner.owner_id}</td>
            <td className="border border-gray-300 p-2">
              {editMode === owner.owner_id ? (
                <input
                  type="text"
                  value={editedData.name || ""}
                  onChange={(e) => handleInputChange(e, "name")}
                  onKeyDown={(e) => handleKeyDown(e, owner.owner_id)}
                  className="w-full p-1 border rounded"
                />
              ) : (
                owner.name
              )}
            </td>
            <td className="border border-gray-300 p-2">
              {editMode === owner.owner_id ? (
                <input
                  type="text"
                  value={editedData.contact_number || ""}
                  onChange={(e) => handleInputChange(e, "contact_number")}
                  onKeyDown={(e) => handleKeyDown(e, owner.owner_id)}
                  className="w-full p-1 border rounded"
                />
              ) : (
                owner.contact_number || "N/A"
              )}
            </td>
            <td className="border border-gray-300 p-2">
              {editMode === owner.owner_id ? (
                <input
                  type="text"
                  value={editedData.email || ""}
                  onChange={(e) => handleInputChange(e, "email")}
                  onKeyDown={(e) => handleKeyDown(e, owner.owner_id)}
                  className="w-full p-1 border rounded"
                />
              ) : (
                owner.email || "N/A"
              )}
            </td>
            <td className="border border-gray-300 p-2">
              {editMode === owner.owner_id ? (
                <input
                  type="text"
                  value={editedData.address || ""}
                  onChange={(e) => handleInputChange(e, "address")}
                  onKeyDown={(e) => handleKeyDown(e, owner.owner_id)}
                  className="w-full p-1 border rounded"
                />
              ) : (
                owner.address || "N/A"
              )}
            </td>
            <td className="border border-gray-300 p-2">
              {editMode === owner.owner_id ? (
                <input
                  type="text"
                  value={editedData.city || ""}
                  onChange={(e) => handleInputChange(e, "city")}
                  onKeyDown={(e) => handleKeyDown(e, owner.owner_id)}
                  className="w-full p-1 border rounded"
                />
              ) : (
                owner.city || "N/A"
              )}
            </td>
            <td className="border border-gray-300 p-2">
              {editMode === owner.owner_id ? (
                <input
                  type="text"
                  value={editedData.state || ""}
                  onChange={(e) => handleInputChange(e, "state")}
                  onKeyDown={(e) => handleKeyDown(e, owner.owner_id)}
                  className="w-full p-1 border rounded"
                />
              ) : (
                owner.state || "N/A"
              )}
            </td>
            <td className="border border-gray-300 p-2">
              {editMode === owner.owner_id ? (
                <input
                  type="text"
                  value={editedData.zipcode || ""}
                  onChange={(e) => handleInputChange(e, "zipcode")}
                  onKeyDown={(e) => handleKeyDown(e, owner.owner_id)}
                  className="w-full p-1 border rounded"
                />
              ) : (
                owner.zipcode || "N/A"
              )}
            </td>
            <td className="border border-gray-300 p-2">
                      {editMode === owner.owner_id ? (
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="w-full p-1 border rounded"
                        />
                      ) : owner.id_proof ? (
                        <a
                          href={`http://localhost:5000${owner.id_proof}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
            <td className="border border-gray-300 p-2">
              <div className="flex justify-center space-x-2">
                {editMode === owner.owner_id ? (
                  <button
                    onClick={() => handleSave(owner.owner_id)}
                    className="text-green-500 hover:text-green-700"
                    title="Save"
                  >
                    <FaSave />
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(owner.owner_id)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(owner.owner_id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <FaTrash />
                </button>
                
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
      </div>
    </div>
  );
}