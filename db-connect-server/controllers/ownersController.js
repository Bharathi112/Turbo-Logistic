const pool = require("../config/db");
const path = require("path");
const fs = require("fs");

// ✅ GET All Owners
const getAllOwners = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM owners_information");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching owners:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET Owner by ID
const getOwnerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM owners_information WHERE owner_id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Owner not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching owner by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET Owner by Username
const getOwnerByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query("SELECT * FROM owners_information WHERE username = $1", [username]);

    if (result.rows.length === 0) return res.status(404).json({ message: "Owner not found" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching owner by username:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ POST (Create New Owner)
const createOwner = async (req, res) => {
  try {
    const {
      name,
      contact_number,
      alternate_number,
      email,
      address,
      city,
      state,
      zipcode,
      extract_idproof_details,
      username,
      pan_number,
      gst_number,
      bank_name, // Add bank_name
      account_number, // Add account_number
      ifsc_code, // Add ifsc_code
      branch_name, // Add branch_name
    } = req.body;

    const id_proof_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO owners_information 
      (name, contact_number, alternate_number, email, address, city, state, zipcode, id_proof, extract_idproof_details, username, pan_number, gst_number, bank_name, account_number, ifsc_code, branch_name) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [
        name,
        contact_number,
        alternate_number,
        email,
        address,
        city,
        state,
        zipcode,
        id_proof_url,
        extract_idproof_details,
        username,
        pan_number,
        gst_number,
        bank_name, // Add bank_name
        account_number, // Add account_number
        ifsc_code, // Add ifsc_code
        branch_name, // Add branch_name
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating owner:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ PUT (Update Owner)
const updateOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      contact_number,
      alternate_number,
      email,
      address,
      city,
      state,
      zipcode,
      extract_idproof_details,
      username,
      pan_number,
      gst_number,
      bank_name, // Add bank_name
      account_number, // Add account_number
      ifsc_code, // Add ifsc_code
      branch_name, // Add branch_name
    } = req.body;

    let id_proof_url = null;

    // Retrieve old image path if exists
    const oldOwner = await pool.query("SELECT id_proof FROM owners_information WHERE owner_id = $1", [id]);

    if (oldOwner.rows.length === 0) return res.status(404).json({ message: "Owner not found" });

    if (req.file) {
      id_proof_url = `/uploads/${req.file.filename}`;

      // Delete old image if it exists
      if (oldOwner.rows[0].id_proof) {
        const oldFilePath = path.join(__dirname, "..", oldOwner.rows[0].id_proof);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
    } else {
      id_proof_url = oldOwner.rows[0].id_proof;
    }

    const result = await pool.query(
      `UPDATE owners_information 
      SET name=$1, contact_number=$2, alternate_number=$3, email=$4, address=$5, city=$6, state=$7, zipcode=$8, id_proof=$9, extract_idproof_details=$10, username=$11, pan_number=$12, gst_number=$13, bank_name=$14, account_number=$15, ifsc_code=$16, branch_name=$17
      WHERE owner_id=$18 RETURNING *`,
      [
        name,
        contact_number,
        alternate_number,
        email,
        address,
        city,
        state,
        zipcode,
        id_proof_url,
        extract_idproof_details,
        username,
        pan_number,
        gst_number,
        bank_name, // Add bank_name
        account_number, // Add account_number
        ifsc_code, // Add ifsc_code
        branch_name, // Add branch_name
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating owner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ DELETE Owner
const deleteOwner = async (req, res) => {
  try {
    const { id } = req.params;

    // Retrieve owner to get the image path
    const oldOwner = await pool.query("SELECT id_proof FROM owners_information WHERE owner_id = $1", [id]);

    if (oldOwner.rows.length === 0) return res.status(404).json({ message: "Owner not found" });

    if (oldOwner.rows[0].id_proof) {
      const oldFilePath = path.join(__dirname, oldOwner.rows[0].id_proof);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    }

    await pool.query("DELETE FROM owners_information WHERE owner_id = $1", [id]);

    res.json({ message: "Owner deleted successfully" });
  } catch (error) {
    console.error("Error deleting owner:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllOwners,
  getOwnerById,
  getOwnerByUsername,
  createOwner,
  updateOwner,
  deleteOwner,
};