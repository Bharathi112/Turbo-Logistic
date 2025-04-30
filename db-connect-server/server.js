// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files

// ✅ Routes
const ownersRouter = require("./routes/owners");
const customersRouter = require("./routes/customers");
const vehiclesRouter = require("./routes/vehicles");
const agencyRouter = require("./routes/agency"); // Add agency routes
app.use("/owners", ownersRouter);
app.use("/customers", customersRouter);
app.use("/vehicles", vehiclesRouter);
app.use("/agency", agencyRouter); // Use agency routes

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});