import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Input, Button, message } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/useAuth';
import '../styles/personalInfo.css';

const PersonalInfoPage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [nicknameError, setNicknameError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigate('/profile');
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    if (nicknameError) {
      setNicknameError('');
    }
  };

  const handleSave = async () => {
    // Validate nickname
    if (!nickname || nickname.length === 0) {
      setNicknameError('请输入昵称');
      return;
    }
    if (nickname.length > 20) {
      setNicknameError('昵称不能超过20个字符');
      return;
    }

    setLoading(true);
    const result = await updateProfile({ nickname });
    setLoading(false);

    if (result.success) {
      message.success('保存成功', 2);
    } else {
      message.error(result.error || '保存失败，请重试', 2);
    }
  };

  return (
    <div className="personal-info-page">
      {/* Header with back button */}
      <div className="personal-info-header">
        <button className="personal-info-back-btn" onClick={handleBack} aria-label="返回">
          <LeftOutlined />
        </button>
        <h1 className="personal-info-header-title">个人信息</h1>
      </div>

      {/* Content */}
      <div className="personal-info-content">
        {/* Avatar */}
        <div className="personal-info-avatar-section">
          <img
            className="personal-info-avatar"
            src={user?.avatar}
            alt="用户头像"
          />
        </div>

        {/* Info fields */}
        <div className="personal-info-fields">
          {/* Nickname - editable */}
          <div className="personal-info-field">
            <span className="personal-info-field-label">昵称</span>
            <div className="personal-info-field-value">
              <Input
                className="personal-info-nickname-input"
                value={nickname}
                onChange={handleNicknameChange}
                placeholder="请输入昵称"
                variant="borderless"
                maxLength={21}
              />
            </div>
          </div>
          {nicknameError && (
            <div className="personal-info-error">{nicknameError}</div>
          )}

          {/* Phone - read only */}
          <div className="personal-info-field">
            <span className="personal-info-field-label">手机号</span>
            <span className="personal-info-field-value">{user?.phone}</span>
          </div>

          {/* Gender - read only */}
          <div className="personal-info-field">
            <span className="personal-info-field-label">性别</span>
            <span className="personal-info-field-value">{user?.gender}</span>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="personal-info-save-area">
        <Button
          type="primary"
          className="personal-info-save-btn"
          onClick={handleSave}
          loading={loading}
          block
        >
          保存
        </Button>
      </div>
    </div>
  );
};

export default PersonalInfoPage;
