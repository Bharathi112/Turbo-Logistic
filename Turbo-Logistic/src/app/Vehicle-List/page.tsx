"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Define the Vehicle interface
interface Vehicle {
  vehicle_id: number;
  registration_number: string;
  owner_id: string;
  vehicle_type: string;
  manufacture_year: string;
  color: string;
  engine_number: string;
  fuel_type: string;
  capacity_tons: string;
  goods_type: string;
  insurance_number: string;
  insurance_expiry_date: string;
  fitness_certificate_number: string;
  fitness_certificate_expiry: string;
  username: string; // Track the user who added the vehicle
}

// Define the Owner interface
interface Owner {
  owner_id: string;
  name: string;
  username: string;
}

// Define the form state (excluding vehicle_id)
interface FormState extends Omit<Vehicle, "vehicle_id"> {}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]); // For search results
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { data: session, status } = useSession(); // Get session and status
  const router = useRouter(); // Initialize useRouter

  // Form state for adding/editing a vehicle
  const [form, setForm] = useState<FormState>({
    registration_number: "",
    owner_id: "",
    vehicle_type: "",
    manufacture_year: "",
    color: "",
    engine_number: "",
    fuel_type: "",
    capacity_tons: "",
    goods_type: "",
    insurance_number: "",
    insurance_expiry_date: "",
    fitness_certificate_number: "",
    fitness_certificate_expiry: "",
    username: session?.user?.preferred_username || "Unknown", // Initialize username
  });

  // State for owners data
  const [owners, setOwners] = useState<Owner[]>([]);

  const vehicleTypes = [
    {
      category: "Based on Body Type (Open/Closed)",
      types: [
        "Open Body Trucks",
        "Flatbed Truck – Open cargo bed for heavy or oversized goods.",
        "Tipper/Dump Truck – Open box with a hydraulic lift for unloading.",
        "Logging Truck – Used for transporting logs with open frame support.",
        "Car Carrier (Open Type) – Open deck for transporting multiple vehicles.",
        "Concrete Mixer Truck – Rotating drum for mixing and transporting concrete.",
        "Tow Truck (Recovery Vehicle) – Used for towing broken-down vehicles.",
        "Tank Truck (Open-top) – Open-top tanks for specific liquids like water.",
        "Closed Body Trucks",
        "Box Truck (Cargo Truck) – Fully enclosed cargo space for general freight.",
        "Refrigerated Truck (Reefer Truck) – Temperature-controlled truck for perishable goods.",
        "Container Truck – Carries large intermodal shipping containers.",
        "Tanker Truck (Fuel, Chemical, LPG, Milk, Water) – Enclosed cylindrical tank for liquids/gases.",
        "Car Carrier (Enclosed Type) – Enclosed trailer for luxury car transportation.",
        "Livestock Truck – Enclosed truck with ventilation for transporting animals.",
      ],
    },
    {
      category: "Based on Axle Configuration (Single/Multi-Axle)",
      types: [
        "Single-Axle Trucks (Light & Medium Duty)",
        "Pickup Truck – 4-wheeler / 6-wheeler",
        "Mini Truck (LCV - Light Commercial Vehicle) – 4-wheeler / 6-wheeler",
        "Single-Axle Box Truck – 6-wheeler",
        "Multi-Axle Trucks (Heavy Duty)",
        "Tandem-Axle Truck – 10-wheeler",
        "Tri-Axle Truck – 12-wheeler",
        "Quad-Axle Truck – 14-wheeler / 16-wheeler",
        "Semi-Trailer Truck (18-Wheeler, Articulated Truck) – 18-wheeler",
        "Rigid Multi-Axle Truck – 22-wheeler / 24-wheeler",
        "Special Heavy-Duty Trucks",
        "Multi-Axle Trailer Truck – 28-wheeler / 32-wheeler",
        "Heavy Haul Truck (Extreme Loads) – 36-wheeler / 40-wheeler",
      ],
    },
    {
      category: "Based on Usage & Industry",
      types: [
        "Construction & Mining Trucks",
        "Dump Truck (Tipper) – For carrying construction materials.",
        "Bulldozer Transport Truck (Lowboy Trailer) – Hauls heavy construction machinery.",
        "Concrete Mixer Truck – For transporting ready-mix concrete.",
        "Agriculture & Rural Transport Trucks",
        "Livestock Truck – For transporting farm animals.",
        "Grain Transport Truck – Enclosed or open truck for carrying grains.",
        "Water Tanker Truck – Used for irrigation and water supply.",
        "Logistics & Freight Trucks",
        "Box Truck (Cargo Truck) – For moving general freight.",
        "Curtainsider Truck – Box truck with side-opening tarpaulin for easy loading.",
        "Reefer Truck – Refrigerated transport for food and medicine.",
        "Oil & Gas Industry Trucks",
        "Crude Oil Tanker – Large-capacity tank truck for petroleum transport.",
        "LPG Tanker Truck – For transporting liquefied petroleum gas.",
        "Fuel Transport Truck – Carries gasoline, diesel, or jet fuel.",
        "Special Purpose Trucks",
        "Fire Truck – Equipped with water hoses and fire-fighting tools.",
        "Garbage Truck (Compactor Truck) – Collects and transports waste.",
        "Armored Truck – Secure transport for cash, valuables, and sensitive materials.",
        "Mobile Crane Truck – Carries a crane for lifting heavy objects.",
      ],
    },
    {
      category: "Based on Trailer Type (For Articulated Trucks)",
      types: [
        "Flatbed Trailer – Open bed for carrying oversized loads.",
        "Lowboy Trailer – Extra-low platform for transporting heavy machinery.",
        "Refrigerated Trailer – Cold storage trailer for food transport.",
        "Tanker Trailer – Liquid/gas transport for fuel, chemicals, or water.",
        "Side-Dump Trailer – Dumping mechanism to unload materials sideways.",
      ],
    },
  ];

  const [editingId, setEditingId] = useState<number | null>(null); // Track the vehicle being edited
  const [view, setView] = useState<"none" | "add" | "list">("list"); // Default view is "list"
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null); // For full details modal
  const [searchQuery, setSearchQuery] = useState<string>(""); // For search input

  // Fetch all vehicles from the API
  const fetchVehicles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/vehicles");
      const preferredUsername = session?.user?.preferred_username || "Unknown";

      // Filter vehicles based on the preferredUsername
      const filteredVehicles = response.data.filter(
        (vehicle: Vehicle) => vehicle.username === preferredUsername
      );

      setVehicles(filteredVehicles);
      setFilteredVehicles(filteredVehicles); // Initialize filtered list
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      alert("Failed to fetch vehicles. Please try again later.");
    }
  };

  // Fetch all owners from the API
  const fetchOwners = async () => {
    try {
      const response = await axios.get("http://localhost:5000/owners");
      const preferredUsername = session?.user?.preferred_username || "Unknown";

      // Filter owners based on the preferredUsername
      const filteredOwners = response.data.filter(
        (owner: Owner) => owner.username === preferredUsername
      );

      setOwners(filteredOwners);

      // Automatically set the owner_id if only one owner is found
      if (filteredOwners.length === 1) {
        setForm((prevForm) => ({
          ...prevForm,
          owner_id: filteredOwners[0].owner_id, // Set the owner_id to the first (and only) owner
        }));
      }
    } catch (error) {
      console.error("Error fetching owners:", error);
      alert("Failed to fetch owners. Please try again later.");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (session) {
      fetchVehicles();
      fetchOwners();
    }
  }, [session]);

  // Handle changes to form inputs
  const handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim().toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setFilteredVehicles(vehicles); // Reset to full list if search is empty
    } else {
      const results = vehicles.filter(
        (vehicle) =>
          vehicle.registration_number.toLowerCase().includes(query) || // Search by registration number
          vehicle.owner_id.toLowerCase().includes(query) || // Search by owner ID
          vehicle.vehicle_type.toLowerCase().includes(query) // Search by vehicle type
      );
      setFilteredVehicles(results); // Display search results
    }
  };

  // Handle form submission (add/edit vehicle)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (form.username === "Unknown") {
      alert("Username is unknown. Please ensure you are logged in.");
      return;
    }

    try {
      if (editingId) {
        // Update existing vehicle
        await axios.put(`http://localhost:5000/vehicles/${editingId}`, form);
        setEditingId(null);
      } else {
        // Add new vehicle
        await axios.post("http://localhost:5000/vehicles", form);
      }

      // Reset form and fetch updated list
      setForm({
        registration_number: "",
        owner_id: "",
        vehicle_type: "",
        manufacture_year: "",
        color: "",
        engine_number: "",
        fuel_type: "",
        capacity_tons: "",
        goods_type: "",
        insurance_number: "",
        insurance_expiry_date: "",
        fitness_certificate_number: "",
        fitness_certificate_expiry: "",
        username: session?.user?.preferred_username || "Unknown", // Reset username
      });
      setSuccessMessage(
        editingId ? "Vehicle updated successfully!" : "Vehicle added successfully!"
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchVehicles(); // Refresh the list
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form. Please try again.");
    }
  };

  // Handle edit vehicle
  const handleEdit = (vehicle: Vehicle) => {
    // Format dates for the input fields (if necessary)
    const formattedVehicle = {
      ...vehicle,
      insurance_expiry_date: vehicle.insurance_expiry_date.split("T")[0], // Remove time part if present
      fitness_certificate_expiry: vehicle.fitness_certificate_expiry.split("T")[0], // Remove time part if present
    };

    setForm(formattedVehicle);
    setEditingId(vehicle.vehicle_id);
    setView("add");
  };

  // Handle delete vehicle
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/vehicles/${id}`);
      fetchVehicles(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Failed to delete vehicle. Please try again.");
    }
  };

  // Handle full details view
  const handleFullDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  // Close full details modal
  const closeFullDetails = () => {
    setSelectedVehicle(null);
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
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="view"
            value="list"
            checked={view === "list"}
            onChange={() => setView("list")}
            className="form-radio"
          />
          <span>Vehicles List</span>
        </label>
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
                registration_number: "",
                owner_id: "",
                vehicle_type: "",
                manufacture_year: "",
                color: "",
                engine_number: "",
                fuel_type: "",
                capacity_tons: "",
                goods_type: "",
                insurance_number: "",
                insurance_expiry_date: "",
                fitness_certificate_number: "",
                fitness_certificate_expiry: "",
                username: session?.user?.preferred_username || "Unknown", // Reset username
              });
            }}
            className="form-radio"
          />
          <span>Add Vehicle</span>
        </label>
      </div>

      {/* Add Vehicle Form */}
      {view === "add" && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-lg shadow-md">
          {/* Form Fields */}
          {[
            { label: "Registration Number", name: "registration_number", required: true },
            { label: "Owner ID", name: "owner_id", required: true, type: "select" },
            {
              label: "Vehicle Type",
              name: "vehicle_type",
              required: true,
              type: "select",
              options: vehicleTypes.flatMap((category) => [
                ...category.types.map((type) => ({ label: type, value: type })), // Map all types as selectable options
              ]),
            },
            { label: "Manufacture Year", name: "manufacture_year", required: true },
            { label: "Color", name: "color", required: true },
            { label: "Engine Number", name: "engine_number", required: true },
            { label: "Fuel Type", name: "fuel_type", required: true },
            { label: "Capacity (Tons)", name: "capacity_tons", required: true },
            { label: "Goods Type", name: "goods_type", required: true },
            { label: "Insurance Number", name: "insurance_number", required: true },
            { label: "Insurance Expiry Date", name: "insurance_expiry_date", required: true, type: "date" },
            { label: "Fitness Certificate Number", name: "fitness_certificate_number", required: true },
            { label: "Fitness Certificate Expiry", name: "fitness_certificate_expiry", required: true, type: "date" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col space-y-2">
              <label className="font-medium">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === "select" ? (
  <select
    name={field.name}
    value={form[field.name as keyof FormState] as string}
    onChange={handleChange}
    required={field.required}
    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select {field.label}</option>
    {field.name === "owner_id"
      ? owners.map((owner) => (
          <option key={owner.owner_id} value={owner.owner_id}>
            {owner.name}
          </option>
        ))
      : vehicleTypes.map((category, index) => (
          <optgroup key={index} label={category.category}>
            {category.types.map((type, subIndex) => (
              <option key={subIndex} value={type}>
                {type}
              </option>
            ))}
          </optgroup>
        ))}
  </select>
) : (
  <input
    type={field.type || "text"}
    name={field.name}
    placeholder={field.label}
    value={form[field.name as keyof FormState] as string}
    onChange={handleChange}
    required={field.required}
    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
)}
            </div>
          ))}

          {/* Submit Button */}
          <button
            type="submit"
            className="col-span-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
          >
            {editingId ? "Update Vehicle" : "Add Vehicle"}
          </button>
        </form>
      )}

      {/* Vehicles List */}
      {view === "list" && (
        <div className="mt-8 px-2 sm:px-4 lg:px-8">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by registration number, owner ID, or vehicle type"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="w-full overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto border border-gray-300 rounded-lg">
              <table className="w-full text-[10px] md:text-xs text-black dark:text-white border-collapse">
                <thead className="bg-gray-200 dark:bg-gray-800 sticky top-0 z-10 shadow-md">
                  <tr className="text-[10px] md:text-xs font-bold border-b border-gray-400">
                    <th className="border border-gray-300 p-2 text-left">Vehicle ID</th>
                    <th className="border border-gray-300 p-2 text-left">Registration Number</th>
                    <th className="border border-gray-300 p-2 text-left">Vehicle Type</th>
                    <th className="border border-gray-300 p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle, index) => (
                      <tr
                        key={vehicle.vehicle_id}
                        className={`${
                          index % 2 === 0 ? "bg-white dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-900"
                        } hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-200`}
                      >
                        <td className="border border-gray-300 p-2 text-left">{vehicle.vehicle_id}</td>
                        <td className="border border-gray-300 p-2 text-left">{vehicle.registration_number}</td>
                        <td className="border border-gray-300 p-2 text-left">{vehicle.vehicle_type}</td>
                        <td className="border border-gray-300 p-2 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(vehicle)}
                            aria-label="Edit vehicle"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition duration-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.vehicle_id)}
                            aria-label="Delete vehicle"
                            className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition duration-300"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleFullDetails(vehicle)}
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
                      <td colSpan={4} className="p-2 text-center text-gray-500 dark:text-gray-400">
                        No vehicles found.
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
      {selectedVehicle && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Vehicle Details
            </h2>
            <div className="max-h-[70vh] overflow-y-auto space-y-4 text-gray-800 dark:text-gray-300">
              <p><strong>Registration Number:</strong> {selectedVehicle.registration_number}</p>
              <p><strong>Owner ID:</strong> {selectedVehicle.owner_id}</p>
              <p><strong>Vehicle Type:</strong> {selectedVehicle.vehicle_type}</p>
              <p><strong>Manufacture Year:</strong> {selectedVehicle.manufacture_year}</p>
              <p><strong>Color:</strong> {selectedVehicle.color}</p>
              <p><strong>Engine Number:</strong> {selectedVehicle.engine_number}</p>
              <p><strong>Fuel Type:</strong> {selectedVehicle.fuel_type}</p>
              <p><strong>Capacity (Tons):</strong> {selectedVehicle.capacity_tons}</p>
              <p><strong>Goods Type:</strong> {selectedVehicle.goods_type}</p>
              <p><strong>Insurance Number:</strong> {selectedVehicle.insurance_number}</p>
              <p><strong>Insurance Expiry Date:</strong> {selectedVehicle.insurance_expiry_date}</p>
              <p><strong>Fitness Certificate Number:</strong> {selectedVehicle.fitness_certificate_number}</p>
              <p><strong>Fitness Certificate Expiry:</strong> {selectedVehicle.fitness_certificate_expiry}</p>
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