const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4202; // Changed the port to 4202

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*", // Adjust according to your security requirements
  })
);

const dbConfig = {
  host: "178.128.221.254",
  user: "gejzmedqjv",
  password: "8SP5EmDwpu",
  database: "gejzmedqjv",
  connectionLimit: 10, // Use connection pool with a limit of 10 connections
};

const pool = mysql.createPool(dbConfig);

app.post("/items", function (req, res) {
  const items = req.body;

  if (!Array.isArray(items)) {
    res.status(400).send("Invalid data format, expected an array of items");
    return;
  }

  const uniqueOrderIds = [...new Set(items.map((item) => item.orderId))];

  const query2 = "INSERT IGNORE INTO `order` (order_id) VALUES ?";
  const values2 = uniqueOrderIds.map((orderId) => [orderId]);

  pool.query(query2, [values2], function (err, result) {
    if (err) {
      console.error("Error inserting into `order` table: " + err.stack);
      res
        .status(500)
        .send("Error inserting into `order` table: " + err.message);
      return;
    }

    const query =
      "INSERT INTO order_item (id, do_num, sku, serial_num, order_id) VALUES ?";
    const values = items.map((item) => [
      item.id,
      item.doId,
      item.sku,
      item.serialNum,
      item.orderId,
    ]);

    pool.query(query, [values], function (err, result) {
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
