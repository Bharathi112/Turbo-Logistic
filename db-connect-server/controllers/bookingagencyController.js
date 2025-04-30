const pool = require("../config/db");

// ✅ Get All Lorry Agencies
const getAllLorryAgencies = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM lorry_agency");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching lorry agencies:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Lorry Agency by ID
const getLorryAgencyById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM lorry_agency WHERE agency_id= $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Lorry agency not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching lorry agency by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Lorry Agency by Agent Username
const getLorryAgencyByAgentUsername = async (req, res) => {
  try {
    const { agent_username } = req.params;
    const result = await pool.query("SELECT * FROM lorry_agency WHERE agent_username = $1", [agent_username]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Lorry agency not found" });
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching lorry agency by agent username:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Create New Lorry Agency
const createLorryAgency = async (req, res) => {
  try {
    const {
      agency_name,
      manager_name,
      contact_person,
      phone_number,
      alternate_phone,
      email,
      website_url,
      address,
      city,
      state,
      country,
      postal_code,
      registration_number,
      gst_number,
      pan_number,
      bank_name,
      bank_account_number,
      ifsc_code,
      status = "Active", // ✅ Default to "Active"
      location,
      agent_username, // ✅ Add agent_username field
      branch, // ✅ Add branch field
    } = req.body;

    // ✅ Validate status
    const validStatuses = ["Active", "Inactive", "Suspended"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value. Allowed values: Active, Inactive, Suspended" });
    }

    const result = await pool.query(
      `INSERT INTO lorry_agency (
        agency_name, manager_name, contact_person, phone_number, alternate_phone, email, website_url,
        address, city, state, country, postal_code, registration_number, gst_number, pan_number,
        bank_name, bank_account_number, ifsc_code, status, location, agent_username, branch
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *`,
      [
        agency_name,
        manager_name,
        contact_person,
        phone_number,
        alternate_phone,
        email,
        website_url,
        address,
        city,
        state,
        country,
        postal_code,
        registration_number,
        gst_number,
        pan_number,
        bank_name,
        bank_account_number,
        ifsc_code,
        status,
        location,
        agent_username, // ✅ Add agent_username value
        branch, // ✅ Add branch value
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating lorry agency:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Lorry Agency
const updateLorryAgency = async (req, res) => {
  try {
    const { agency_id } = req.params;
    const {
      agency_name,
      manager_name,
      contact_person,
      phone_number,
      alternate_phone,
      email,
      website_url,
      address,
      city,
      state,
      country,
      postal_code,
      registration_number,
      gst_number,
      pan_number,
      bank_name,
      bank_account_number,
      ifsc_code,
      status,
      location,
      agent_username,
      branch,
    } = req.body;

    const result = await pool.query(
      `UPDATE lorry_agency SET
        agency_name = $1, manager_name = $2, contact_person = $3, phone_number = $4, alternate_phone = $5,
        email = $6, website_url = $7, address = $8, city = $9, state = $10, country = $11, postal_code = $12,
        registration_number = $13, gst_number = $14, pan_number = $15, bank_name = $16, bank_account_number = $17,
        ifsc_code = $18, status = $19, location = $20, agent_username = $21, branch = $22, updated_at = CURRENT_TIMESTAMP
      WHERE agency_id = $23 RETURNING *`,
      [
        agency_name,
        manager_name,
        contact_person,
        phone_number,
        alternate_phone,
        email,
        website_url,
        address,
        city,
        state,
        country,
        postal_code,
        registration_number,
        gst_number,
        pan_number,
        bank_name,
        bank_account_number,
        ifsc_code,
        status,
        location,
        agent_username,
        branch,
        agency_id,
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Lorry agency not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating lorry agency:", error);
    res.status(500).json({ error: "Failed to update lorry agency" });
  }
};
// ✅ Delete Lorry Agency
const deleteLorryAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM lorry_agency WHERE agency_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Lorry agency not found" });
    res.json({ message: "Lorry agency deleted successfully", deletedAgency: result.rows[0] });
  } catch (error) {
    console.error("Error deleting lorry agency:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllLorryAgencies,
  getLorryAgencyById,
  getLorryAgencyByAgentUsername, // ✅ Export the new function
  createLorryAgency,
  updateLorryAgency,
  deleteLorryAgency,
};