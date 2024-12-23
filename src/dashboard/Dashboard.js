import { useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import HamburgerMenu from "../components/HamburgerMenu";
import {
  SolutionOutlined,
  PlusOutlined,
  LogoutOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

import StudentRegistration from "./StudentRegistration";  
import CourseRegistration from "./CourseRegistration";  
import Result from "./Results";  
import TeacherRegistration from "./TeacherRegistration";  
import adminPicture from "../assets/Mohsinadmin.jpeg";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { message } from "antd";
import SidebarBg from "../assets/Sidebarimg.jpeg"
export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      message.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      message.error("Error logging out!");
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
     
      <div
        className={`fixed md:static top-0 left-0 z-20 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 w-full md:py-0 py-20 px-5 shadow-2xl md:w-1/4 bg-gray-400 text-white min-h-screen overflow-y-auto`}
        style={{
          backgroundImage: `url(${SidebarBg})`,
          backgroundSize: 'cover',  // This will make the background cover the entire sidebar area
          backgroundPosition: 'center',  // This ensures the background image is centered
        }}
      >
        <nav className="relative z-10 w-full flex flex-col items-center  py-6">
          {/* Admin Profile */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={adminPicture}
              alt="Admin"
              className="rounded-full w-24 h-24 object-cover border-4 border-white shadow-md"
            />
            <h2 className="text-lg font-semibold mt-4">Admin Dashboard!</h2>
          </div>

          {/* Sidebar Links */}
          <div className="space-y-20 w-full ">
            {/* Management Section */}
            <div className="space-y-4 text-center ">
              {[{ name: "Student Registration", icon: <UserAddOutlined />, path: "student-registration" },
                { name: "Course Registration", icon: <PlusOutlined />, path: "course-registration" },
                { name: "Teacher Registration", icon: <UserAddOutlined />, path: "teacher-registration" },
                  { name: "Result", icon: <SolutionOutlined />, path: "result" }].map((item) => (
                  <Link
                    key={item.name}
                    className="flex items-center text-center  font-medium text-md py-3 w-full border-gray-100 border  rounded-lg px-10 transition duration-300 hover:bg-gray-50 hover:text-black"
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ))}
            </div>

            {/* Logout Button */}
            <div className="mt-8">
              <button
                className="flex items-center font-bold text-md px-10 py-2 w-full bg-red-700 rounded-lg transition duration-300 hover:bg-red-600 hover:text-white"
                onClick={handleLogout}
              >
                <LogoutOutlined className="mr-3" />
                Logout
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Hamburger Menu */}
      <div className="absolute top-4 left-4 md:hidden z-30">
        <HamburgerMenu isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content Area */}
      <div className="w-full md:w-4/5 p-6 bg-white overflow-auto">
        <Routes>
          <Route path="student-registration" element={<StudentRegistration />} />
          <Route path="course-registration" element={<CourseRegistration />} />
          <Route path="result" element={<Result />} />
          <Route path="teacher-registration" element={<TeacherRegistration />} />
        </Routes>
      </div>

    </div>
    
  );
}
