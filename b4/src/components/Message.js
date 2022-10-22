import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Space,
  Table,
  Popconfirm,
  Button,
  Form,
  Input,
  Modal,
  Typography,
} from "antd";
const { Title } = Typography;

const messagesUrl =
  "https://cs3219-assignment-b-dot-buoyant-embassy-366006.as.r.appspot.com/api/message";

const modsUrl =
  "https://asia-southeast1-b4-366212.cloudfunctions.net/filterData";

const fetchData = async () => {
  const res = await axios({
    method: "GET",
    url: messagesUrl,
  });
  return res.data;
};

const fetchMods = async () => {
  const res = await axios({
    method: "GET",
    url: modsUrl,
  });
  return res.data;
};

const layoutAdd = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 18,
  },
};

const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 18,
  },
};

const MessageEditForm = ({ open, onSave, onCancel, record_id }) => {
  const [form1] = Form.useForm();
  return (
    <Modal
      open={open}
      title="Editing message..."
      okText="Save"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={async () => {
        const values = form1.getFieldsValue();
        await onSave(record_id, values.name, values.content);
      }}
    >
      <Form
        form={form1}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          modifier: "public",
        }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {
              required: true,
              message: "Enter new name here!",
            },
          ]}
        >
          <Input placeholder="Enter new name here" />
        </Form.Item>
        <Form.Item
          name="content"
          label="Content"
          rules={[
            {
              required: true,
              message: "Enter new content here!",
            },
          ]}
        >
          <Input type="textarea" placeholder="Enter new content here" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const Messages = () => {
  const [form] = Form.useForm();
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [modules, setModules] = useState([]);

  const addMessage = async (values) => {
    const response = await axios({
      method: "POST",
      url: messagesUrl,
      data: {
        name: values.name,
        content: values.content,
      },
    });
    const newMessage = response.data;
    setMessages([...messages, newMessage.data]);
  };

  const deleteMessage = (id) => {
    const newMessages = messages.filter((msg) => msg._id !== id);
    setMessages(newMessages);

    return axios({
      method: "DELETE",
      url: messagesUrl + "/" + id,
    });
  };

  const updateMessage = async (id, name, content) => {
    const response = await axios({
      method: "PUT",
      url: messagesUrl + "/" + id,
      data: {
        name: name,
        content: content,
      },
    });
    const newMessage = response.data.data;
    const updatedMessages = messages.map((msg) =>
      msg._id === id ? newMessage : msg
    );
    setOpen(false);
    setMessages(updatedMessages);
  };

  const columns = [
    {
      title: "S/N",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 50,
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Content", dataIndex: "content", key: "content" },
    {
      title: "Actions",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          {messages.length >= 1 ? (
            <div>
              <Button
                onClick={() => {
                  setOpen(true);
                }}
              >
                Edit
              </Button>
              <MessageEditForm
                open={open}
                onSave={updateMessage}
                onCancel={() => {
                  setOpen(false);
                }}
                record_id={record._id}
              />
            </div>
          ) : null}
          {messages.length >= 1 ? (
            <Popconfirm
              placement="left"
              title={`Are you sure you want to delete this message?`}
              onConfirm={() => deleteMessage(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button>Delete</Button>
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ];

  const mods = [
    {
      title: "Module Code",
      dataIndex: "moduleCode",
    },
    {
      title: "Title",
      dataIndex: "moduleTitle",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
  ];

  useEffect(() => {
    async function fetch() {
      const response = await fetchData();
      setMessages(response.data);
      const response1 = await fetchMods();
      setModules(response1);
    }
    fetch();
    console.log(messages);
    console.log(modules);
  }, []);

  return (
    <>
      <div
        style={{
          width: "100%",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <div style={{ width: "50%" }}>
          <Form
            {...layoutAdd}
            form={form}
            name="control-hooks"
            onFinish={addMessage}
          >
            <Space style={{ width: "100%", justifyContent: "center" }}>
              <Title level={5}>Add a new message</Title>
            </Space>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input placeholder="Enter name here" />
            </Form.Item>
            <Form.Item
              name="content"
              label="Content"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input placeholder="Enter content here" />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <Table columns={columns} dataSource={messages} />
      <Space style={{ width: "100%", justifyContent: "center" }}>
        <Title level={5}>
          Computer Science modules offered in NUS for year Academic Year
          2022-2023
        </Title>
      </Space>
      <Table columns={mods} dataSource={modules} />
    </>
  );
};

export default Messages;
