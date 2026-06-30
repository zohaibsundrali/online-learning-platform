import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../common/Toast/ToastProvider';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import { User,  Key, Save, Camera } from 'lucide-react';
import axiosInstance from '../../../api/axios';

const ProfileSettings = () => {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Updating profile...');

    try {
      const response = await axiosInstance.put('/auth/updatedetails', profileData);
      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Updating password...');

    try {
      const response = await axiosInstance.put('/auth/updatepassword', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.data.success) {
        toast.success('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="card">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveSection('profile')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeSection === 'profile'
                  ? 'bg-primary bg-opacity-10 text-primary'
                  : 'text-text text-opacity-60 hover:text-primary hover:bg-primary hover:bg-opacity-5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveSection('security')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeSection === 'security'
                  ? 'bg-primary bg-opacity-10 text-primary'
                  : 'text-text text-opacity-60 hover:text-primary hover:bg-primary hover:bg-opacity-5'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Security</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="lg:col-span-3">
        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="card">
            <h3 className="text-xl font-semibold text-text mb-6">Profile Settings</h3>
            <form onSubmit={handleProfileUpdate}>
              {/* Avatar */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-background text-3xl font-bold">
                    {profileData.name?.charAt(0) || 'U'}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 p-1.5 bg-card border border-border rounded-full hover:border-primary transition-colors duration-300"
                  >
                    <Camera className="w-4 h-4 text-text" />
                  </button>
                </div>
                <div>
                  <p className="text-text font-semibold">{profileData.name}</p>
                  <p className="text-sm text-text text-opacity-60">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    rows="3"
                    placeholder="Tell us about yourself..."
                    maxLength="200"
                  />
                  <p className="text-xs text-text text-opacity-40 mt-1">
                    {profileData.bio?.length || 0}/200 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-background border border-border rounded-card text-text text-opacity-40 cursor-not-allowed"
                  />
                  <p className="text-xs text-text text-opacity-40 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
          <div className="card">
            <h3 className="text-xl font-semibold text-text mb-6">Change Password</h3>
            <form onSubmit={handlePasswordUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    required
                    minLength="6"
                  />
                  <p className="text-xs text-text text-opacity-40 mt-1">
                    Password must be at least 6 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-card text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;