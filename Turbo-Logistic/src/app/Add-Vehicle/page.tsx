"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const VehicleForm = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
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
  });

  const [owners, setOwners] = useState<{ owner_id: string; name: string }[]>([]);
  const [error, setError] = useState("");

  const preferredUsername = session?.user?.name || "";
  const access_token = session?.access_token;

  // Fetch owners from API
  useEffect(() => {
    if (status !== "authenticated" || !preferredUsername || !access_token) return;

    const fetchCustomersByUsername = async () => {
      try {
        setError("");
        const response = await axios.get(
          `http://localhost:5000/owners/username/${preferredUsername}`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );

        // Ensure the response is always an array
        const ownersData = Array.isArray(response.data) ? response.data : [response.data];
        setOwners(ownersData);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError("Customers not found");
        setOwners([]);
      }
    };

    fetchCustomersByUsername();
  }, [preferredUsername, access_token, status]);

  // Check if the user has the required role
  useEffect(() => {
    if (status === "loading") return;

    const userRoles = session?.user?.roles || [];
    const allowedRoles = ["Turbo-Logistic-Management", "Owners"];
    const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasAccess) {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "owner_id") {
      // Find the selected owner from the owners list
      const selectedOwner = owners.find((owner) => owner.owner_id === value);

      // Log the selected owner's name and id to the console
      if (selectedOwner) {
        console.log("Selected Owner Name:", selectedOwner.name);
        console.log("Selected Owner ID:", selectedOwner.owner_id);
      }

      // Update the form data
      setFormData({
        ...formData,
        owner_id: value,
      });
    } else {
      // Handle other fields
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);

    try {
      const response = await axios.post("http://localhost:5000/vehicles", formData);
      console.log("Vehicle created:", response.data);
      alert("Vehicle details submitted successfully!");
      setFormData({
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
      });
    } catch (error) {
      console.error("Error creating vehicle:", error);
      alert("Failed to submit vehicle details. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 shadow-lg rounded-lg bg-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
        Lorry Vehicle Details Form
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registration Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Registration Number
            </label>
            <input
              type="text"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          {/* Owner ID (Dropdown) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Owner</label>
            <select
              name="owner_id"
              value={formData.owner_id}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            >
              <option value="" disabled>Select owner</option>
              {Array.isArray(owners) &&
                owners.map((owner) => (
                  <option key={owner.owner_id} value={owner.owner_id}>
                    {owner.name} - {owner.owner_id}
                  </option>
                ))}
            </select>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Type</label>
            <input
              type="text"
              name="vehicle_type"
              value={formData.vehicle_type}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          {/* Manufacture Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Manufacture Year
            </label>
            <input
              type="text"
              name="manufacture_year"
              value={formData.manufacture_year}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          {/* Engine Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Engine Number
            </label>
            <input
              type="text"
              name="engine_number"
              value={formData.engine_number}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fuel Type</label>
            <input
              type="text"
              name="fuel_type"
              value={formData.fuel_type}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          {/* Capacity Tons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Capacity Tons
            </label>
            <input
              type="text"
              name="capacity_tons"
              value={formData.capacity_tons}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          {/* Goods Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goods Type</label>
            <input
              type="text"
              name="goods_type"
              value={formData.goods_type}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          {/* Insurance Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Insurance Number
            </label>
            <input
              type="text"
              name="insurance_number"
              value={formData.insurance_number}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          {/* Insurance Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Insurance Expiry Date
            </label>
            <input
              type="date"
              name="insurance_expiry_date"
              value={formData.insurance_expiry_date}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          {/* Fitness Certificate Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fitness Certificate Number
            </label>
            <input
              type="text"
              name="fitness_certificate_number"
              value={formData.fitness_certificate_number}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          {/* Fitness Certificate Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fitness Certificate Expiry
            </label>
            <input
              type="date"
              name="fitness_certificate_expiry"
              value={formData.fitness_certificate_expiry}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;