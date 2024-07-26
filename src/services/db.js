const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4201;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all origins

// Set up connection to the database
const connection = mysql.createConnection({
  host: "178.128.221.254",
  user: "antzpcgtre",
  password: "AwKJ54HupF",
  database: "antzpcgtre", // Ensure correct database name
});

// Connect to database
connection.connect(function (err) {
  if (err) {
    console.error("Error connecting to the database: " + err.stack);
    return;
  }
  console.log("Connected to the database as id " + connection.threadId);
});

// Listen to POST requests to /items
app.post("/items", function (req, res) {
  const items = req.body;

  if (!Array.isArray(items)) {
    res.status(400).send("Invalid data format, expected an array of items");
    return;
  }

  // Extract unique order_ids
  const uniqueOrderIds = [...new Set(items.map((item) => item.orderId))];

  // Insert into `order` table if not already present
  const query2 = "INSERT IGNORE INTO `order` (order_id) VALUES ?";
  const values2 = uniqueOrderIds.map((orderId) => [orderId]);

  connection.query(query2, [values2], function (err, result) {
    if (err) {
      console.error("Error inserting into `order` table: " + err.stack);
      res
        .status(500)
        .send("Error inserting into `order` table: " + err.message);
      return;
    }

    // Prepare data for `order_item` table
    const query =
      "INSERT INTO order_item (id, do_num, sku, serial_num, order_id) VALUES ?";
    const values = items.map((item) => [
      item.id,
      item.doId,
      item.sku,
      item.serialNum,
      item.orderId, // Use the same orderId
    ]);

    connection.query(query, [values], function (err, result) {
      if (err) {
        console.error("Error inserting into `order_item` table: " + err.stack);
        res
          .status(500)
          .send("Error inserting into `order_item` table: " + err.message);
        return;
      }
      res.send("Success");
    });
  });
});

app.listen(port, function () {
  console.log(`Server listening on port ${port}`);
});
