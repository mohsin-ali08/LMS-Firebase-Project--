import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig'; // Firebase Firestore
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'; // Firestore methods
import { Table, Button, message, Modal, Spin, Form, Input } from 'antd'; // Ant Design components
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const CourseRegistration = () => {
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm(); // Ant Design form instance

  // Fetch courses from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'courses'), (snapshot) => {
      setCourses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setTableLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveCourse = async () => {
    try {
      const values = await form.validateFields(); // Validate form inputs
      setLoading(true);

      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), {
          name: values.courseName,
          duration: values.courseDuration,
          timing: values.courseTiming,
        });
        message.success('Course updated successfully');
      } else {
        await addDoc(collection(db, 'courses'), {
          name: values.courseName,
          duration: values.courseDuration,
          timing: values.courseTiming,
        });
        message.success('Course added successfully');
      }

      form.resetFields(); // Reset the form
      setIsModalOpen(false); // Close modal
      setEditingCourse(null);
    } catch (error) {
      console.error('Error saving course:', error);
      message.error('Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      message.success('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      message.error('Failed to delete course');
    }
  };

  const handleEdit = (record) => {
    setEditingCourse(record); // Set course for editing
    form.setFieldsValue({
      courseName: record.name,
      courseDuration: record.duration,
      courseTiming: record.timing,
    }); // Populate form with existing values
    setIsModalOpen(true); // Open modal
  };

  const columns = [
    { title: 'Course Name', dataIndex: 'name', key: 'name' },
    { title: 'Duration', dataIndex: 'duration', key: 'duration' },
    { title: 'Timing', dataIndex: 'timing', key: 'timing' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-4">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
            className="text-blue-600"
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => deleteCourse(record.id)}
            type="link"
            danger
            className="text-red-600"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="md:p-1 pt-10">
      <div className="flex justify-between items-center mb-6 bg-gray-900 p-3 rounded">
        <h2 className="text-xl font-bold text-white">Course Registration</h2>
        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields(); // Reset form for a new course
            setEditingCourse(null); // Clear editing state
            setIsModalOpen(true); // Open modal
          }}
          type="none"
          className="bg-green-600 font-semibold text-white hover:bg-green-700"
        >
          Add Course
        </Button>
      </div>

      <Spin spinning={tableLoading} tip="Loading courses...">
        <div className="overflow-x-auto">
          <Table
            dataSource={courses}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 6 }}
            bordered
            size="middle"
            scroll={{ x: 'max-content' }}
          />
        </div>
      </Spin>

      <Modal
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
        visible={isModalOpen}
        onOk={saveCourse}
        onCancel={() => setIsModalOpen(false)}
        okText={loading ? <Spin /> : editingCourse ? 'Update' : 'Add'}
        cancelText="Cancel"
        okButtonProps={{ disabled: loading }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            courseName: '',
            courseDuration: '',
            courseTiming: '',
          }}
        >
          <Form.Item
            label="Course Name"
            name="courseName"
            rules={[{ required: true, message: 'Please input the course name!' }]}
          >
            <Input placeholder="Enter course name" />
          </Form.Item>

          <Form.Item
            label="Course Duration"
            name="courseDuration"
            rules={[{ required: true, message: 'Please input the course duration!' }]}
          >
            <Input placeholder="Enter course duration" />
          </Form.Item>

          <Form.Item
            label="Course Timing"
            name="courseTiming"
            rules={[{ required: true, message: 'Please input the course timing!' }]}
          >
            <Input placeholder="Enter course timing" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseRegistration;
