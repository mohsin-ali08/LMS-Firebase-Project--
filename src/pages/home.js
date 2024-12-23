import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Form, Input, Button, Typography, message, Divider, Card } from "antd";
import { MailOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import loginImage from "../assets/Homepage.jpeg"; // Image path

const { Title, Text } = Typography;

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    const { email, password } = values;
    setLoading(true);
 
    
    try {
      // Authenticate user with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
  
      // Fetch the user from Firestore based on the email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        message.error("No user found with this email.");
      } else {
        // Log the results of the query to debug
        querySnapshot.forEach((doc) => {
          // console.log(doc.id, " => ", doc.data()); // Log the document data
          const userData = doc.data();
          const userType = userData.type; // Use 'type' instead of 'userType'
  
          // Log the userType to check what we are getting
          console.log("User Type:", userType);
          console.log("current User:", user);
  
          if (userType === "admin") {
            message.success("Admin Login successful!");
            navigate("/dashboard"); // Navigate to admin dashboard
          } else if (userType === "student") {
            message.success("Student Login successful!");
            navigate("/student-dashboard"); // Navigate to student dashboard
          } else {
            message.error("Invalid user type.");
          }
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      message.error("Invalid email or password. Please try again.");
    }
    setLoading(false);
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="flex flex-col lg:flex-row w-full max-w-7xl bg-white shadow-lg overflow-hidden">
        {/* Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-200">
          <div className="w-full max-w-lg">
            <Card className="shadow-lg rounded-xl bg-white" style={{ borderRadius: "12px" }}>
              <Title level={2} className="text-center text-gray-800 text-xl md:text-2xl">
                User Login
              </Title>
              <Divider />
              <Text type="none" className="block text-center text-gray-700 text-sm md:text-base">
                Welcome to the Learning Management System! Access resources, courses, and more based on your role.
              </Text>

              <Form className="py-4 bg-gray-100 px-2 rounded-lg" layout="vertical" onFinish={handleLogin}>
                <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter your email!" }]}>
                  <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Enter your email" className="rounded-lg py-2" />
                </Form.Item>

                <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please enter your password!" }]}>
                  <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Enter your password" className="rounded-lg py-2" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="none"
                    icon={<LoginOutlined />}
                    className="bg-blue-700 py-5 text-white font-semibold hover:bg-blue-600 rounded-lg"
                    htmlType="submit"
                    loading={loading}
                    block
                  >
                    Login
                  </Button>
                </Form.Item>
              </Form>

              <div className="text-center">
                <Text type="secondary" className="block mt-2 text-gray-500 text-xs md:text-sm">
                  Dive into your personalized learning journey. Discover courses, track progress, and unlock educational resources crafted just for you.
                </Text>
              </div>
            </Card>
          </div>
        </div>

        {/* Image Section with Content at the Bottom */}
        <div className="w-full lg:w-1/2 relative hidden lg:block">
          <div className="absolute bottom-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-end justify-center z-10 p-6">
            <div className="text-center text-white pb-[50px]">
              <h2 className="text-2xl font-bold mb-2 md:text-2xl">Learning Management System</h2>
              <p className="text-sm md:text-lg">
                This system enables seamless management of educational content, student information, and resources. Log in to access personalized dashboards and enhance your learning experience.
              </p>
            </div>
          </div>
          <img src={loginImage} alt="Learning Management System" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
