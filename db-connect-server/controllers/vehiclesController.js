// controllers/vehicleController.js
const pool = require("../config/db");
const path = require("path");
const fs = require("fs");

// ✅ GET All Vehicles
const getAllVehicles = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vehicle_information");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET Vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM vehicle_information WHERE vehicle_id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Vehicle not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching vehicle by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ POST (Create New Vehicle)
const createVehicle = async (req, res) => {
  try {
    const {
      registration_number, owner_id, vehicle_type, manufacture_year, color, engine_number,
      fuel_type, capacity_tons, goods_type, insurance_number, insurance_expiry_date,
      fitness_certificate_number, fitness_certificate_expiry
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vehicle_information (registration_number, owner_id, vehicle_type, manufacture_year, color, 
      engine_number, fuel_type, capacity_tons, goods_type, insurance_number, insurance_expiry_date,
      fitness_certificate_number, fitness_certificate_expiry) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        registration_number, owner_id, vehicle_type, manufacture_year, color, engine_number,
        fuel_type, capacity_tons, goods_type, insurance_number, insurance_expiry_date,
        fitness_certificate_number, fitness_certificate_expiry
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ PUT (Update Vehicle)
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      registration_number, owner_id, vehicle_type, manufacture_year, color, engine_number,
      fuel_type, capacity_tons, goods_type, insurance_number, insurance_expiry_date,
      fitness_certificate_number, fitness_certificate_expiry
    } = req.body;

    const result = await pool.query(
      `UPDATE vehicle_information 
      SET registration_number=$1, owner_id=$2, vehicle_type=$3, manufacture_year=$4, color=$5, 
      engine_number=$6, fuel_type=$7, capacity_tons=$8, goods_type=$9, insurance_number=$10, 
      insurance_expiry_date=$11, fitness_certificate_number=$12, fitness_certificate_expiry=$13
      WHERE vehicle_id=$14 RETURNING *`,
      [
        registration_number, owner_id, vehicle_type, manufacture_year, color, engine_number,
        fuel_type, capacity_tons, goods_type, insurance_number, insurance_expiry_date,
        fitness_certificate_number, fitness_certificate_expiry, id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ DELETE Vehicle
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM vehicle_information WHERE vehicle_id = $1", [id]);

    if (result.rows.length === 0) return res.status(404).json({ message: "Vehicle not found" });

    await pool.query("DELETE FROM vehicle_information WHERE vehicle_id = $1", [id]);

    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
