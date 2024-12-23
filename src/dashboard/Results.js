import { useState, useEffect } from "react";
import { Table, Button, Modal, Input, message, Spin, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { db, auth } from "../config/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [grade, setGrade] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [editingResult, setEditingResult] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");

  // Function to fetch data from Firestore
  const fetchResults = () => {
    const resultsCollection = collection(db, "results");
    const unsubscribe = onSnapshot(resultsCollection, (snapshot) => {
      const resultList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResults(resultList);
      setLoading(false);
    });
    return unsubscribe;
  };

  // Use useEffect to fetch results and handle authentication state
  useEffect(() => {
    const unsubscribe = fetchResults();

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminEmail(user.email);
      }
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  // Check if a result for the student already exists by email
  const checkIfResultExists = async (email) => {
    const resultsCollection = collection(db, "results");
    const q = query(resultsCollection, where("studentEmail", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  // Handle adding a new result
const handleUpload = async () => {
  if (!studentName || !subject || !marks || !grade || !studentEmail) {
    message.error("Please fill all fields: student name, subject, marks, grade, and email!");
    return;
  }

  try {
    const resultExists = await checkIfResultExists(studentEmail);
    if (resultExists) {
      message.error("Results already added for this email.");
      return;
    }

    const newResult = {
      studentName,
      subject,
      marks,
      grade,
      studentEmail,
      timestamp: new Date(),
    };

    const docRef = await addDoc(collection(db, "results"), newResult);
    setResults((prevResults) => [
      ...prevResults,
      { id: docRef.id, ...newResult },
    ]);

    message.success("Result added successfully!");
    resetModalState();
  } catch (error) {
    message.error("Error adding result: " + error.message);
  }
};


  // Handle editing a result
  const openEditModal = (result) => {
    setEditingResult(result);
    setStudentName(result.studentName);
    setSubject(result.subject);
    setMarks(result.marks);
    setGrade(result.grade);
    setStudentEmail(result.studentEmail);
    setIsModalVisible(true);
  };

  const handleEditSave = async () => {
    if (!studentName.trim() || !subject.trim() || !marks.trim() || !grade.trim() || !studentEmail.trim()) {
      message.error("All fields must be filled!");
      return;
    }

    try {
      const resultRef = doc(db, "results", editingResult.id);
      await updateDoc(resultRef, { studentName, subject, marks, grade, studentEmail });

      setResults((prevResults) =>
        prevResults.map((result) =>
          result.id === editingResult.id
            ? { ...result, studentName, subject, marks, grade, studentEmail }
            : result
        )
      );

      message.success("Result updated successfully!");
      resetModalState();
    } catch (error) {
      message.error("Error updating result: " + error.message);
    }
  };

  // Handle deleting a result
  const handleDelete = async (resultId) => {
    try {
      await deleteDoc(doc(db, "results", resultId));
      setResults((prevResults) => prevResults.filter((result) => result.id !== resultId));
      message.success("Result deleted successfully!");
    } catch (error) {
      message.error("Error deleting result: " + error.message);
    }
  };

  // Reset modal state
  const resetModalState = () => {
    setIsModalVisible(false);
    setEditingResult(null);
    setStudentName("");
    setSubject("");
    setMarks("");
    setGrade("");
    setStudentEmail("");
  };

  // Table columns
  const columns = [
    { title: "Student Name", dataIndex: "studentName", key: "studentName" },
    { title: "Subject", dataIndex: "subject", key: "subject" },
    { title: "Marks", dataIndex: "marks", key: "marks" },
    { title: "Grade", dataIndex: "grade", key: "grade" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto md:p-2 py-10">
      <div className="flex justify-between items-center mb-4 bg-gray-900 py-3 px-4 rounded-lg">
        <h1 className="text-2xl text-white font-semibold">Results Management</h1>
        <Button
          className="bg-green-600 font-semibold text-white hover:bg-green-700"
          type="none"
          onClick={() => resetModalState() || setIsModalVisible(true)}
        >
          Add Result
        </Button>
      </div>

      <Spin spinning={loading} tip="Loading Results...">
        <div className="overflow-x-auto">
          <Table
            dataSource={results}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 6 }}
            className="mt-4"
            scroll={{ x: "max-content" }}
          />
        </div>
      </Spin>

      <Modal
        title={editingResult ? "Edit Result" : "Add Result"}
        visible={isModalVisible}
        onCancel={resetModalState}
        onOk={editingResult ? handleEditSave : handleUpload}
        okText={editingResult ? "Save Changes" : "Add Result"}
        width={600}
      >
        <div className="space-y-4">
          <Input
            placeholder="Student Name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Input
            placeholder="Marks"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
          />
          <Input
            placeholder="Grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
          <Input
            placeholder="Student Email"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Results;
