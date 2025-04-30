const express = require("express");
const router = express.Router();
const {
  getAllLorryAgencies,
  getLorryAgencyById,
  getLorryAgencyByAgentUsername, // ✅ Import the new function
  createLorryAgency,
  updateLorryAgency,
  deleteLorryAgency,
} = require("../controllers/bookingagencyController");

// ✅ Routes
router.get("/", getAllLorryAgencies); // Get all lorry agencies
router.get("/:id", getLorryAgencyById); // Get lorry agency by ID
router.get("/username/:username", getLorryAgencyByAgentUsername); // ✅ Get lorry agency by agent username
router.post("/", createLorryAgency); // Create new lorry agency
router.put("/:agency_id", updateLorryAgency);
router.delete("/:id", deleteLorryAgency);

module.exports = router;