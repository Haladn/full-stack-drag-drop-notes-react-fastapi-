import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import "../styles/Form.css";
const Form = ({ route, method }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    if (!email || !password) {
      alert("Enter email/password");
      return;
    }
    try {
      const form_data = new URLSearchParams();
      form_data.append("username", email);
      form_data.append("password", password);
      const res = await api.post(route, form_data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access_token);
        navigate("/");
      } else {
        alert("Signed up successfully");
        navigate("/login");
      }
    } catch (error) {
      alert(error.response.data.detail);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="form-container">
      <h2 className="title">
        {method.charAt(0).toUpperCase() + method.slice(1)}
      </h2>
      <form onSubmit={handleSubmit}>
        <label className="form-label">Email:</label>
        <br />
        <input
          className="form-input"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />{" "}
        <br />
        <label className="form-label">Password:</label>
        <br />
        <input
          className="form-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />{" "}
        <br />
        <button className="form-btn" type="submit">
          {method}
        </button>
      </form>
      {method === "login" && (
        <div className="anchor">
          <Link to="/register">Sign up here</Link>
        </div>
      )}

      {method === "register" && (
        <div className="anchor">
          <Link to="/login">already have an account, login here</Link>
        </div>
      )}
    </div>
  );
};

export default Form;
