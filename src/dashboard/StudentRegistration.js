import React, { useEffect, useState } from 'react';
import { db, auth } from '../config/firebaseConfig';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Table, Button, Modal, Input, message} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const AddStudent = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if the user is authenticated and an admin
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAdmin(user.email === 'admin08@gmail.com'); // Replace with your admin email
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []);

  // Fetch users from Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(
        snapshot.docs.map((doc, index) => ({
          id: doc.id,
          number: index + 1,
          ...doc.data(),
        }))
      );
    });
    return () => unsubscribe(); // Cleanup Firestore listener
  }, []);

  const addUser = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      message.warning('Please enter name, email, and password');
      return;
    }
    if (!isAdmin) {
      message.warning('You are not authorized to add users');
      return;
    }
  
    setLoading(true);
    const adminUser = auth.currentUser; // Save admin session
    try {
      // Create new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
  
      // Add user details to Firestore
      await addDoc(collection(db, 'users'), {
        name,
        email,
        type: 'student',
        uid: newUser.uid,
      });
  
      message.success('User added successfully');
  
      // Reauthenticate admin
      await auth.updateCurrentUser(adminUser);
  
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Error adding user:', error);
      message.error('Failed to add user. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Open Edit Modal
  const openEditModal = (user) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // Password is typically not retrieved for security reasons
    setIsEditModalOpen(true);
  };

  // Edit user details in Firestore
  const editUser = async () => {
    if (!name.trim() || !email.trim()) {
      message.warning('Please enter name and email');
      return;
    }
    if (!isAdmin) {
      message.warning('You are not authorized to edit users');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', editingUserId);
      await updateDoc(userRef, { name, email });
      message.success('User updated successfully');
      setIsEditModalOpen(false);
      setName('');
      setEmail('');
    } catch (error) {
      console.error('Error editing user:', error);
      message.error('Failed to edit user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete user from Firestore
  const deleteUser = async (userId) => {
    if (!isAdmin) {
      message.warning('You are not authorized to delete users');
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
      message.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user. Please try again.');
    }
  };

  // Table columns
  const columns = [
    { title: 'No.', dataIndex: 'number', key: 'number' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, user) => (
        <div className="flex">
          <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(user)}>
            Edit
          </Button>
          <Button type="link" icon={<DeleteOutlined />} danger onClick={() => deleteUser(user.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 md:p-1 pt-10">
      {/* Navbar */}
      <div className="flex justify-between items-center bg-gray-900 shadow p-4 rounded">
        <h2 className="text-xl font-semibold text-white">Student Registration</h2>
        <Button
          className="bg-green-600 font-semibold text-white hover:bg-green-700"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        className="bg-white rounded-lg"
      />

      {/* Add User Modal */}
      <Modal
        title="Add New User"
        visible={isModalOpen}
        onOk={addUser}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={loading}
        okText="Add"
        cancelText="Cancel"
      >
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3"
        />
        <Input.Password
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        visible={isEditModalOpen}
        onOk={editUser}
        onCancel={() => setIsEditModalOpen(false)}
        confirmLoading={loading}
        okText="Update"
        cancelText="Cancel"
      >
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3"
        />
      </Modal>
    </div>
  );
};

export default AddStudent;
