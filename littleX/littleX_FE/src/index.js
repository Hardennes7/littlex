import React from "react";
import ReactDOM from "react-dom/client";

function App() {
    return (
        <div style={{ padding: "20px" }}>
            <h1>✨ littleX is Running!</h1>
            <p>Open at: http://localhost:3000</p>
            <button onClick={() => alert("Working!")}>Test Button</button>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
