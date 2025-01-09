import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import API_URL from "../constants";

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL + "api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (err) {
        setError("Не удалось загрузить профиль. Проверьте авторизацию.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleEmailChange = async () => {
    try {
      await axios.put(
        API_URL + "api/profile/change-email/",
        { email: newEmail },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Почта успешно изменена. Пожалуйста, войдите в систему снова.");
      localStorage.removeItem("accessToken");
      navigate("/login");
    } catch (err) {
      alert("Ошибка при изменении почты.");
    }
  };

  const handlePasswordChange = async () => {
    const { oldPassword, newPassword, confirmNewPassword } = passwordData;
    if (newPassword !== confirmNewPassword) {
      alert("Новые пароли не совпадают.");
      return;
    }
    try {
      await axios.put(
        API_URL + "api/profile/change-password/",
        { old_password: oldPassword, new_password: newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Пароль успешно изменён. Пожалуйста, войдите в систему снова.");
      localStorage.removeItem("accessToken");
      navigate("/login");
    } catch (err) {
      alert("Ошибка при изменении пароля.");
    }
  };

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="profile-container">
      <h1>Профиль</h1>
      <div className="profile-info">
        <p>
          <strong>Email:</strong>{" "}
          {isEditingEmail ? (
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          ) : (
            profile.email
          )}
        </p>
        {isEditingEmail ? (
          <button onClick={handleEmailChange}>Изменить</button>
        ) : (
          <button onClick={() => setIsEditingEmail(true)}>Смена почты</button>
        )}
        <button onClick={() => setIsEditingPassword(true)}>Смена пароля</button>
      </div>
      {isEditingPassword && (
        <div className="password-change-form">
          <input
            type="password"
            placeholder="Старый пароль"
            value={passwordData.oldPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, oldPassword: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Новый пароль"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, newPassword: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Повторите новый пароль"
            value={passwordData.confirmNewPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmNewPassword: e.target.value,
              })
            }
          />
          <button onClick={handlePasswordChange}>Изменить</button>
        </div>
      )}
    </div>
  );
};

export default Profile;
