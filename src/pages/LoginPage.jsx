import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router';
import { Form, Input, Button } from 'antd';
import { useAuth } from '../contexts/useAuth';
import { LogoutOutlined } from '@ant-design/icons';
import '../styles/login.css';

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState('');

  // If already authenticated, redirect to /home immediately
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const onFinish = (values) => {
    setLoginError('');
    const result = login(values.username, values.password);
    if (result.success) {
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    } else {
      setLoginError('用户名或密码错误');
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Button 
            type="button" 
            className="login-back-btn" 
            onClick={handleBack} 
            icon={<LogoutOutlined />}
          >
          </Button>
          <h2 className="login-title">用户登录</h2>
        </div>
        {loginError && <div className="login-error">{loginError}</div>}
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="username"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: '请输入用户名',
                whitespace: true,
              },
              {
                max: 20,
                message: '用户名最多20个字符',
              },
            ]}
          >
            <Input
              placeholder="请输入用户名"
              maxLength={20}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: '请输入密码',
                whitespace: true,
              },
              {
                max: 32,
                message: '密码最多32个字符',
              },
            ]}
          >
            <Input.Password
              placeholder="请输入密码"
              maxLength={32}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block className="login-btn">
              登录
            </Button>
          </Form.Item>

          <div className="login-footer">
            <span>还没有账号？</span>
            <Button type="link" onClick={() => navigate('/register')}>
              去注册
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
