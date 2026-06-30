import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../common/Toast/ToastProvider';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import { User, Key, Save, Camera, X, Upload } from 'lucide-react';
import axiosInstance from '../../../api/axios';

const ProfileSettings = () => {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const fileInputRef = useRef(null);

  // ✅ Initialize profile data with proper fallbacks
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '', // ✅ Fallback to empty string if undefined
  });

  // ✅ Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    const toastId = toast.loading('Uploading profile picture...');

    try {
      const response = await axiosInstance.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const updatedUser = response.data.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      const errorMsg = error.response?.data?.message || 'Failed to upload profile picture';
      toast.error(errorMsg);
    } finally {
      toast.dismiss(toastId);
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle avatar removal
  const handleRemoveAvatar = async () => {
   // ✅ Use window.confirm explicitly
if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

    setUploading(true);
    const toastId = toast.loading('Removing profile picture...');

    try {
      const response = await axiosInstance.delete('/users/avatar');
      if (response.data.success) {
        const updatedUser = response.data.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile picture removed successfully');
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error(error.response?.data?.message || 'Failed to remove profile picture');
    } finally {
      toast.dismiss(toastId);
      setUploading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Updating profile...');

    try {
      const response = await axiosInstance.put('/auth/updatedetails', profileData);
      if (response.data.success) {
        const updatedUser = response.data.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
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

  // Handle password update
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
            
            {/* Avatar Upload Section */}
            <div className="flex items-center space-x-6 mb-6 p-4 bg-background rounded-card border border-border">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors duration-300">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        parent.innerHTML = `
                          <div class="w-full h-full bg-primary flex items-center justify-center text-background text-3xl font-bold">
                            ${user?.name?.charAt(0) || 'U'}
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-background text-3xl font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                
                {/* Upload Button Overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2 bg-primary rounded-full hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50 shadow-lg"
                >
                  <Camera className="w-4 h-4 text-background" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1">
                <p className="text-text font-semibold">{user?.name || 'User'}</p>
                <p className="text-sm text-text text-opacity-60">{user?.email || 'No email'}</p>
                
                <div className="flex items-center space-x-3 mt-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs text-primary hover:text-secondary transition-colors duration-300 flex items-center space-x-1 disabled:opacity-50"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                  </button>
                  
                  {user?.avatar && (
                    <>
                      <span className="text-text text-opacity-20">|</span>
                      <button
                        onClick={handleRemoveAvatar}
                        disabled={uploading}
                        className="text-xs text-accent hover:text-opacity-80 transition-colors duration-300 flex items-center space-x-1 disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </>
                  )}
                </div>
                
                {uploading && (
                  <div className="mt-2 flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-xs text-text text-opacity-60">Uploading...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name || ''}
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
                    value={profileData.bio || ''}
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
                disabled={loading || uploading}
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
                disabled={loading || uploading}
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