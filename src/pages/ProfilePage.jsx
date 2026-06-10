import React from 'react';
import { useNavigate } from 'react-router';
import {
  FileTextOutlined,
  LogoutOutlined,
  RightOutlined,
  ShoppingOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Button, Modal } from 'antd';

import BottomNav from '../components/BottomNav';
import { ORDER_STATUS } from '../constants/orderStatus';
import { useAuth } from '../contexts/useAuth';
import '../styles/profile.css';

const ProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    Modal.confirm({
      title: '确定要退出登录吗？',
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        await logout();
        navigate('/login');
      },
    });
  };

  return (
    <main className="profile-page">
      <section className="phone-app">
        {/* User header */}
        <div className="profile-header">
          {isAuthenticated ? (
            <>
              <img
                className="profile-avatar"
                src={user.avatar}
                alt={user.nickname}
              />
              <div className="profile-user-info">
                <span className="profile-nickname">{user.nickname}</span>
                <span className="profile-phone">{user.phone}</span>
              </div>
            </>
          ) : (
            <>
              <div className="profile-avatar-placeholder">
                <UserOutlined />
              </div>
              <div className="profile-user-info">
                <span className="profile-not-logged">未登录</span>
                <Button
                  className="profile-login-btn"
                  type="primary"
                  size="small"
                  onClick={() => navigate('/login')}
                >
                  去登录
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Order section and features - only shown when authenticated */}
        {isAuthenticated && (
          <>
            {/* Order shortcuts */}
            <div className="profile-order-section">
              <div className="profile-order-title">
                <span className="profile-order-heading">我的订单</span>
                <a
                  href="/orderList"
                  className="profile-order-view-all"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/orderList');
                  }}
                >
                  全部订单
                  <RightOutlined />
                </a>
              </div>
              <div className="profile-order-shortcuts">
                <button
                  type="button"
                  className="profile-order-shortcut"
                  onClick={() => navigate('/orderList')}
                >
                  <ShoppingOutlined />
                  <span>全部</span>
                </button>
                <button
                  type="button"
                  className="profile-order-shortcut"
                  onClick={() => navigate(`/orderList?status=${ORDER_STATUS.unpaid}`)}
                >
                  <WalletOutlined />
                  <span>待付款</span>
                </button>
                <button
                  type="button"
                  className="profile-order-shortcut"
                  onClick={() => navigate(`/orderList?status=${ORDER_STATUS.paid}`)}
                >
                  <FileTextOutlined />
                  <span>已付款</span>
                </button>
              </div>
            </div>

            {/* Feature entries */}
            <div className="profile-features">
              <button
                className="profile-feature-item"
                type="button"
                onClick={() => navigate('/profile/info')}
              >
                <UserOutlined />
                个人信息
                <RightOutlined className="feature-arrow" />
              </button>
              <button
                className="profile-feature-item"
                type="button"
                onClick={() => navigate('/orderList')}
              >
                <ShoppingOutlined />
                我的订单
                <RightOutlined className="feature-arrow" />
              </button>
            </div>

            {/* Logout button */}
            <Button
              className="profile-logout-btn"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              danger
            >
              退出登录
            </Button>
          </>
        )}
      </section>

      <BottomNav />
    </main>
  );
};

export default ProfilePage;
