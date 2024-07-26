const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4201; // Ensure the port is correct

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*", // Adjust according to your security requirements
  })
);

let connection;

function handleDisconnect() {
  connection = mysql.createConnection({
    host: "178.128.221.254",
    user: "gejzmedqjv",
    password: "8SP5EmDwpu",
    database: "gejzmedqjv",
    port: 3306,
  });

  connection.connect(function (err) {
    if (err) {
      console.error("Error connecting to the database: " + err.stack);
      setTimeout(handleDisconnect, 2000); // Retry after 2 seconds
    } else {
      console.log("Connected to the database as id " + connection.threadId);
    }
  });

  connection.on("error", function (err) {
    console.error("Database error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

app.post("/items", function (req, res) {
  const items = req.body;

  if (!Array.isArray(items)) {
    res.status(400).send("Invalid data format, expected an array of items");
    return;
  }

  const uniqueOrderIds = [...new Set(items.map((item) => item.orderId))];

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

    const query =
      "INSERT INTO order_item (id, do_num, sku, serial_num, order_id) VALUES ?";
    const values = items.map((item) => [
      item.id,
      item.doId,
      item.sku,
      item.serialNum,
      item.orderId,
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
