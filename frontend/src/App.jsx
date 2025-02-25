import { useState } from "react";
import axios from "axios";

const backendURL = "https://image-processing-app-0ufx.onrender.com"; // Use Render's backend URL

function App() {
  const [file, setFile] = useState(null);
  const [requestId, setRequestId] = useState("");
  const [status, setStatus] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(backendURL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRequestId(response.data.requestId);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const checkStatus = async () => {
    if (!requestId) return alert("Enter a valid Request ID");

    try {
      const response = await axios.get(
        `http://localhost:3000/status/${requestId}`
      );
      setStatus(response.data);
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload CSV File</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={uploadFile}>Upload</button>
      <br />
      <br />

      <h2>Check Processing Status</h2>
      <input
        type="text"
        placeholder="Enter Request ID"
        value={requestId}
        onChange={(e) => setRequestId(e.target.value)}
      />
      <button onClick={checkStatus}>Check Status</button>
      <br />
      <br />

      {status && (
        <div>
          <h3>Status: {status.status}</h3>
          <h3>Products:</h3>
          <ul>
            {status.products?.map((product, index) => (
              <li key={index}>
                <strong>{product.productName}</strong>
                <br />
                Input URLs: {product.inputUrls.join(", ")}
                <br />
                Output URLs: {product.outputUrls?.join(", ") || "Processing..."}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
