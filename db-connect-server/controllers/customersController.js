const pool = require("../config/db");
const path = require("path");
const fs = require("fs");

// ✅ GET All Customers
const getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customer_details");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET Customer by ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM customer_details WHERE customer_id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Customer not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET Customer by Username
const getCustomerByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    // Fetch all rows with the given username
    const result = await pool.query("SELECT * FROM customer_details WHERE username = $1", [username]);

    // If no rows are found, return a 404 error
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No customers found with the given username" });
    }

    // Return all matching rows
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching customers by username:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET Customers by Agent Username
const getCustomersByAgentUsername = async (req, res) => {
  try {
    const { agent_username } = req.params;

    // Fetch all rows with the given agent_username
    const result = await pool.query("SELECT * FROM customer_details WHERE agent_username = $1", [agent_username]);

    // If no rows are found, return a 404 error
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No customers found for the given agent username" });
    }

    // Return all matching rows
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching customers by agent username:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ POST (Create New Customer)
const createCustomer = async (req, res) => {
  try {
    const {
      customer_name,
      email,
      phone_number,
      address,
      city,
      state,
      postal_code,
      country,
      preferred_language,
      goods_type,
      goods_weight_in_tons,
      goods_volume_in_cubic_meters,
      pickup_address,
      pickup_state,
      pickup_date_time,
      delivery_state,
      delivery_address,
      delivery_date_time,
      payment_method,
      pickup_pin,
      delivery_pin,
      customer_type,
      agent_username, // New Field
    } = req.body;

    const result = await pool.query(
      `INSERT INTO customer_details (
        customer_name, email, phone_number, address, city, state, postal_code, country, preferred_language,
        goods_type, goods_weight_in_tons, goods_volume_in_cubic_meters, pickup_address, pickup_state,
        pickup_date_time, delivery_state, delivery_address, delivery_date_time, payment_method, pickup_pin, delivery_pin,
        customer_type, agent_username
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) RETURNING *`,
      [
        customer_name,
        email,
        phone_number,
        address,
        city,
        state,
        postal_code,
        country,
        preferred_language,
        goods_type,
        goods_weight_in_tons,
        goods_volume_in_cubic_meters,
        pickup_address,
        pickup_state,
        pickup_date_time,
        delivery_state,
        delivery_address,
        delivery_date_time,
        payment_method,
        pickup_pin,
        delivery_pin,
        customer_type,
        agent_username, // New Field
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ PUT (Update Customer)
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_name,
      email,
      phone_number,
      address,
      city,
      state,
      postal_code,
      country,
      preferred_language,
      goods_type,
      goods_weight_in_tons,
      goods_volume_in_cubic_meters,
      pickup_address,
      pickup_state,
      pickup_date_time,
      delivery_state,
      delivery_address,
      delivery_date_time,
      payment_method,
      pickup_pin,
      delivery_pin,
      customer_type,
      vehicle_id,
      registration_number,
      agent_username, // New Field
    } = req.body;

    // Validate required fields
    if (!customer_name) {
      return res.status(400).json({ error: "customer_name is required" });
    }

    const result = await pool.query(
      `UPDATE customer_details 
      SET 
        customer_name=$1, email=$2, phone_number=$3, address=$4, city=$5, state=$6, postal_code=$7, country=$8, preferred_language=$9,
        goods_type=$10, goods_weight_in_tons=$11, goods_volume_in_cubic_meters=$12, pickup_address=$13, pickup_state=$14,
        pickup_date_time=$15, delivery_state=$16, delivery_address=$17, delivery_date_time=$18, payment_method=$19, pickup_pin=$20, delivery_pin=$21,
        customer_type=$22, vehicle_id=$23, registration_number=$24, agent_username=$25
      WHERE customer_id=$26 RETURNING *`,
      [
        customer_name,
        email,
        phone_number,
        address,
        city,
        state,
        postal_code,
        country,
        preferred_language,
        goods_type,
        goods_weight_in_tons,
        goods_volume_in_cubic_meters,
        pickup_address,
        pickup_state,
        pickup_date_time,
        delivery_state,
        delivery_address,
        delivery_date_time,
        payment_method,
        pickup_pin,
        delivery_pin,
        customer_type,
        vehicle_id,
        registration_number,
        agent_username, // New Field
        id,
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Customer not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ DELETE Customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM customer_details WHERE customer_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getCustomerByUsername,
  deleteCustomer,
  getCustomersByAgentUsername, // Add this
};