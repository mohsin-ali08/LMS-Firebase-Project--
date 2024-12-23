import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Space, Typography } from "antd";
import { signOut } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig"; // Import Firebase auth and Firestore
import { getDoc, doc } from "firebase/firestore"; // For fetching user data from Firestore

const { Text } = Typography;

const Navbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(""); // To store the user's name
  const [isLoggedIn, setIsLoggedIn] = useState(false); // To track login state

  useEffect(() => {
    const checkLoginStatus = () => {
      const user = auth.currentUser;
      if (user) {
        setIsLoggedIn(true); // User is logged in
        fetchUserName(user.uid); // Fetch the user name
      } else {
        setIsLoggedIn(false); // No user is logged in
      }
    };

    checkLoginStatus(); // Check login status on mount

    // Listen for auth state changes (for example, when the user logs in or out)
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setIsLoggedIn(true);
        fetchUserName(user.uid);
      } else {
        setIsLoggedIn(false);
        setUserName(""); // Clear user name on logout
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  // Fetch user name from Firestore
  const fetchUserName = async (uid) => {
    const userRef = doc(db, "users", uid); // Reference to the user's Firestore document
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setUserName(userSnap.data().name); // Ensure you're using the correct field name (e.g., 'name')
    } else {
      console.log("No such user document!");
    }
  };
  

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase logout
      navigate("/"); // Redirect to the home page
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-4">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-2xl font-semibold text-white">
          My Dashboard
        </Link>

        <div className="flex items-center space-x-4">
          {isLoggedIn && userName && (
            <Text className="text-lg text-white">{`Welcome, ${userName}`}</Text> // Display user name if logged in
          )}
          <Space>
            {!isLoggedIn ? (
              <Button type="primary" onClick={() => navigate("/")}>Login</Button> // Show Login if not logged in
            ) : (
              <Button type="primary" onClick={handleLogout}>Logout</Button> // Show Logout if logged in
            )}
          </Space>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
