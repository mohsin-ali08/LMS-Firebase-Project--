import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig'; // Firebase Firestore
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'; // Firestore methods
import { Table, Button, Input, message, Modal, Spin } from 'antd'; // Ant Design components
import { PlusOutlined } from '@ant-design/icons';

const TeacherRegistration = () => {
  const [teachers, setTeachers] = useState([]);
  const [teacherName, setTeacherName] = useState('');
  const [teacherDesignation, setTeacherDesignation] = useState('');
  const [teacherProfileUrl, setTeacherProfileUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'teachers'), (snapshot) => {
      setTeachers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setDataLoading(false);
    });

    return () => {
      setDataLoading(true);
      unsubscribe();
    };
  }, []);

  const handleTeacherSubmit = async () => {
    if (!teacherName.trim() || !teacherDesignation.trim() || !teacherProfileUrl.trim()) {
      message.warning('Please enter teacher name, designation, and profile URL');
      return;
    }

    setLoading(true);
    try {
      if (editingTeacherId) {
        // Update teacher
        const teacherRef = doc(db, 'teachers', editingTeacherId);
        await updateDoc(teacherRef, {
          name: teacherName,
          designation: teacherDesignation,
          profileUrl: teacherProfileUrl,
        });
        message.success('Teacher updated successfully');
      } else {
        // Add new teacher
        await addDoc(collection(db, 'teachers'), {
          name: teacherName,
          designation: teacherDesignation,
          profileUrl: teacherProfileUrl,
        });
        message.success('Teacher added successfully');
      }

      resetForm();
    } catch (error) {
      console.error('Error submitting teacher:', error);
      message.error('Failed to submit teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setTeacherName(teacher.name);
    setTeacherDesignation(teacher.designation);
    setTeacherProfileUrl(teacher.profileUrl);
    setEditingTeacherId(teacher.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (teacherId) => {
    try {
      await deleteDoc(doc(db, 'teachers', teacherId));
      message.success('Teacher deleted successfully');
    } catch (error) {
      message.error('Failed to delete teacher');
    }
  };

  const resetForm = () => {
    setTeacherName('');
    setTeacherDesignation('');
    setTeacherProfileUrl('');
    setEditingTeacherId(null);
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: 'Profile',
      dataIndex: 'profileUrl',
      key: 'profileUrl',
      render: (text) => <img src={text} alt="Teacher Profile" className="w-12 h-12 rounded-full" />,
    },
    { title: 'Teacher Name', dataIndex: 'name', key: 'name' },
    { title: 'Designation', dataIndex: 'designation', key: 'designation' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <span className="flex space-x-2">
          <Button type="link" onClick={() => handleEdit(record)} className="text-blue-500 hover:text-blue-700">
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-red-700">
            Delete
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto md:p-1 pt-10">
      <div className="flex items-center justify-between mb-6 bg-gray-900 py-3 px-3 rounded">
        <h2 className="text-2xl font-semibold text-white">Teacher Registration</h2>
        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-green-600 font-semibold text-white hover:bg-green-700"
        >
          Add Teacher
        </Button>
      </div>

      {/* Table displaying teachers with loading spinner */}
      <Spin spinning={dataLoading} tip="Loading Teachers...">
        <div className="overflow-x-auto">
          <Table
            dataSource={teachers}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 6 }}
            className="mt-4"
            scroll={{ x: 'max-content' }}
          />
        </div>
      </Spin>

      {/* Modal to add or edit teacher */}
      <Modal
        title={editingTeacherId ? 'Edit Teacher' : 'Add New Teacher'}
        visible={isModalOpen}
        onOk={handleTeacherSubmit}
        onCancel={resetForm}
        okText={loading ? <Spin /> : editingTeacherId ? 'Update' : 'Add'}
        cancelText="Cancel"
        okButtonProps={{ disabled: loading }}
      >
        <div>
          <Input
            placeholder="Enter teacher name"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="mb-4"
          />
          <Input
            placeholder="Enter teacher designation"
            value={teacherDesignation}
            onChange={(e) => setTeacherDesignation(e.target.value)}
            className="mb-4"
          />
          <Input
            placeholder="Enter teacher profile image URL"
            value={teacherProfileUrl}
            onChange={(e) => setTeacherProfileUrl(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default TeacherRegistration;
