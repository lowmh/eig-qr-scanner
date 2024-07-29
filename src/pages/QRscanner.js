import { Html5QrcodeScanner } from "html5-qrcode";
import { useState, useEffect } from "react";
import { Grid, Card, CardContent, Button, Typography } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

const generateUniqueId = () => uuidv4();

function QRScanner() {
  const [id, setId] = useState(1);
  const [scanResult1, setScanResult1] = useState("");
  const [scanResult2, setScanResult2] = useState("");
  const [sku, setSku] = useState("");
  const [activeInput, setActiveInput] = useState(null);
  const [allResults, setAllResults] = useState([]);
  // ** error message
  const [errors, setErrors] = useState({
    doNumber: "",
    sku: "",
    serialNumber: "",
  });

  useEffect(() => {
    const storedData = sessionStorage.getItem("itemData");
    if (storedData) {
      setAllResults(JSON.parse(storedData));
    }
    if (activeInput) {
      const scanner = new Html5QrcodeScanner("reader", {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 50,
      });

      function success(result) {
        if (activeInput === "input1") {
          setScanResult1(result);
        } else if (activeInput === "input2") {
          setScanResult2(result);
        }
        scanner.clear(); // Clear the scanner after a successful scan
      }

      function error(err) {
        console.warn("QR Code scan error:", err);
      }

      scanner.render(success, error);

      return () => {
        scanner.clear();
      };
    }
  }, [activeInput]);

  const handleInputFocus = (inputId) => {
    setActiveInput(inputId);
  };

  const handleChange = (event) => {
    setSku(event.target.value);
  };

  const handleSubmit = () => {
    let valid = true;
    const newErrors = { doNumber: "", sku: "", serialNumber: "" };

    if (!scanResult1) {
      newErrors.doNumber = "DO Number is required.";
      valid = false;
    }
    if (!sku) {
      newErrors.sku = "SKU is required.";
      valid = false;
    }
    if (!scanResult2) {
      newErrors.serialNumber = "Serial Number is required.";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    setId(id + 1);
    const result = {
      id: id,
      doId: scanResult1,
      sku: sku,
      serialNum: scanResult2,
    };

    setAllResults((prevResults) => {
      const updatedResults = [...prevResults, result];
      sessionStorage.setItem("itemData", JSON.stringify(updatedResults));
      return updatedResults;
    });

    setScanResult1("");
    setScanResult2("");
    setSku("");
    setErrors({ doNumber: "", sku: "", serialNumber: "" }); // Clear errors
  };

  const handleReset = () => {
    setScanResult1("");
    setScanResult2("");
    setSku("");
  };

  const handleCertainRemove = (index) => () => {
    setAllResults((prevResults) => {
      const updatedResults = prevResults.filter((_, i) => i !== index);
      sessionStorage.setItem("itemData", JSON.stringify(updatedResults));
      return updatedResults;
    });
  };

  const handleFormSubmit = () => {
    const orderId = generateUniqueId();
    fetch("http://localhost:3001/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        allResults.map((result) => ({
          id: result.id,
          doId: result.doId,
          sku: result.sku,
          serialNum: result.serialNum,
          orderId: orderId,
        }))
      ),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text);
          });
        }
        return response.text();
      })
      .then((data) => {
        if (data === "Success") {
          alert("Data submitted successfully!");
          handleFormClear(); // Clear the form after successful submission
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("There was an error submitting the data: " + error.message);
      });
  };

  const handleFormClear = () => {
    sessionStorage.removeItem("itemData");
    setAllResults([]);
  };

  return (
    <Card className="app">
      <CardContent>
        <Typography variant="h4" gutterBottom>
          QR Code Scanner
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <div id="reader" className="reader"></div>
          </Grid>
          <Grid container item xs={12} spacing={2} alignItems="center">
            <Grid item xs={12} sm={1.5}>
              <Typography>DO Number:</Typography>
            </Grid>
            <Grid item xs={12} sm={10}>
              <input
                value={scanResult1}
                id="input1"
                onFocus={() => handleInputFocus("input1")}
                readOnly
                className="input-field"
              />
              {errors.doNumber && (
                <Typography color="error">{errors.doNumber}</Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={1.5}>
              <Typography>SKU:</Typography>
            </Grid>
            <Grid item xs={12} sm={10}>
              <input
                type="text"
                value={sku}
                id="sku-input"
                onChange={handleChange}
                className="input-field"
              />
              {errors.sku && (
                <Typography color="error">{errors.sku}</Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={1.5}>
              <Typography>Serial Number:</Typography>
            </Grid>
            <Grid item xs={12} sm={10}>
              <input
                value={scanResult2}
                id="input2"
                onFocus={() => handleInputFocus("input2")}
                readOnly
                className="input-field"
              />
              {errors.serialNumber && (
                <Typography color="error">{errors.serialNumber}</Typography>
              )}
            </Grid>
          </Grid>

          <Grid
            item
            xs={12}
            container
            spacing={2}
            justifyContent="flex-start"
            style={{ marginTop: 20 }}
          >
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="primary" onClick={handleReset}>
                Reset
              </Button>
            </Grid>
          </Grid>
          {allResults.length > 0 && (
            <Grid id="result-table" item xs={12} style={{ marginTop: 20 }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>DO Number</th>
                    <th>SKU</th>
                    <th>Serial Number</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {allResults.map((result, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{result.doId}</td>
                      <td>{result.sku}</td>
                      <td>{result.serialNum}</td>
                      <td>
                        <Button onClick={handleCertainRemove(index)}>x</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Grid
                item
                xs={12}
                container
                spacing={2}
                justifyContent="flex-start"
                style={{ marginTop: 20, paddingBottom: 50 }}
              >
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleFormSubmit}
                  >
                    Submit
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleFormClear}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default QRScanner;
