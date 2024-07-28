const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4202;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);

const dbConfig = {
  host: "178.128.221.254",
  user: "gejzmedqjv",
  password: "8SP5EmDwpu",
  database: "gejzmedqjv",
  connectionLimit: 10,
};

const pool = mysql.createPool(dbConfig);

app.post("/items", function (req, res) {
  const items = req.body;

  if (!Array.isArray(items)) {
    console.error("Invalid data format, expected an array of items");
    return res
      .status(400)
      .send("Invalid data format, expected an array of items");
  }

  // Check for missing required fields in items
  for (const item of items) {
    if (!item.doId || !item.sku || !item.serialNum) {
      console.error("Missing required fields in item:", item);
      return res.status(400).send("Missing required fields in item");
    }
  }

  const uniqueOrderIds = [...new Set(items.map((item) => item.orderId))];

  const insertOrderQuery = "INSERT IGNORE INTO `order` (order_id) VALUES ?";
  const orderValues = uniqueOrderIds.map((orderId) => [orderId]);

  console.log("Inserting into `order` table:", orderValues);

  pool.query(insertOrderQuery, [orderValues], function (err, result) {
    if (err) {
      console.error("Error inserting into `order` table:", err);
      return res
        .status(500)
        .send("Error inserting into `order` table: " + err.message);
    }

    const insertOrderItemQuery =
      "INSERT INTO order_item (id, do_num, sku, serial_num, order_id) VALUES ?";
    const orderItemValues = items.map((item) => [
      item.id,
      item.doId,
      item.sku,
      item.serialNum,
      item.orderId,
    ]);

    console.log("Inserting into `order_item` table:", orderItemValues);

    pool.query(insertOrderItemQuery, [orderItemValues], function (err, result) {
      if (err) {
        console.error("Error inserting into `order_item` table:", err);
        return res
          .status(500)
          .send("Error inserting into `order_item` table: " + err.message);
      }
      res.send("Success");
    });
  });
});

app.listen(port, function () {
  console.log(`Server listening on port ${port}`);
});
