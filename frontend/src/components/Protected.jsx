// import React, { useEffect } from 'react'
// import { useNavigate } from 'react-router';

// function Protected(props) {
//     const { Pro } = props
//     const nav = useNavigate();
//     const logIn = localStorage.getItem("loggedIn");
//     useEffect(() =>{
//          if(!logIn){
//             nav("/Login")
//          }

         
//     })
//   return (
//     <div>
//       <Pro  />
//     </div>
//   )
// }

// export default Protected


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Protected({ Pro }) {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        nav("/Login");
        return;
      }

      try {
        await axios.get("http://localhost:5000/api/auth/protected", {
          headers: { "x-auth-token": token },
        });
        setLoading(false); // token is valid
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("loggedIn");
        nav("/Login");
      }
    };

    checkAuth();
  }, [nav]);

  if (loading) return <div>Loading...</div>;

  return <Pro />;
}

export default Protected;
