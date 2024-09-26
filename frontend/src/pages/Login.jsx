import React from "react";
import Form from "../components/Form";
const Login = () => {
  return (
    <div>
      <Form route="/user/login/token" method={"login"} />
    </div>
  );
};

export default Login;
