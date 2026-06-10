import React from 'react';
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { Form, Input, Button, message } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/useAuth';
import '../styles/register.css';

const RegisterPage = () => {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState('');
  const [loading, setLoading] = useState(false);

  // 已登录则跳转首页
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const onFinish = async (values) => {
    setRegisterError('');
    setLoading(true);

    const result = await register(values.username, values.password, {
      nickname: values.nickname,
      phone: values.phone,
    });

    setLoading(false);

    if (result.success) {
      message.success('注册成功，已自动登录');
      navigate('/home', { replace: true });
    } else {
      setRegisterError(result.error || '注册失败，请重试');
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <Button
            type="button"
            className="register-back-btn"
            onClick={handleBack}
            icon={<LeftOutlined />}
          />
          <h2 className="register-title">用户注册</h2>
        </div>

        {registerError && <div className="register-error">{registerError}</div>}

        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名', whitespace: true },
              { min: 3, message: '用户名至少3个字符' },
              { max: 20, message: '用户名最多20个字符' },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: '用户名只能包含字母、数字和下划线',
              },
            ]}
          >
            <Input placeholder="请输入用户名（3-20个字符）" maxLength={20} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码', whitespace: true },
              { min: 6, message: '密码至少6个字符' },
              { max: 32, message: '密码最多32个字符' },
            ]}
          >
            <Input.Password placeholder="请输入密码（6-32个字符）" maxLength={32} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" maxLength={32} />
          </Form.Item>

          <Form.Item
            name="nickname"
            rules={[{ max: 20, message: '昵称最多20个字符' }]}
          >
            <Input placeholder="请输入昵称（选填）" maxLength={20} />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              {
                pattern: /^1[3-9]\d{9}$/,
                message: '请输入正确的手机号',
              },
            ]}
          >
            <Input placeholder="请输入手机号（选填）" maxLength={11} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="register-btn"
              loading={loading}
            >
              注册
            </Button>
          </Form.Item>

          <div className="register-footer">
            <span>已有账号？</span>
            <Button type="link" onClick={() => navigate('/login')}>
              去登录
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;
