import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Clock,
  Image,
  Activity,
  Download,
  FileText,
  User as UserIcon,
} from "lucide-react";
import { toast } from "react-toastify";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const backend = import.meta.env.VITE_BACKEND;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const [profileResponse, activitiesResponse] = await Promise.all([
          axios.get(`${backend}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${backend}/api/users/activity`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProfile(profileResponse.data?.data || null);
        setActivities(activitiesResponse.data?.data || []);
      } catch (error) {
        toast.error(error.message || "Failed to fetch profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [backend]);

  const renderActivityIcon = (actionType) => {
    const iconMap = {
      "background-removal": <Image className="text-blue-500" />,
      login: <UserIcon className="text-green-500" />,
      "image-upload": <FileText className="text-purple-500" />,
      download: <Download className="text-teal-500" />,
    };
    return iconMap[actionType] || <Activity className="text-gray-500" />;
  };

  const groupActivitiesByDate = (activities) => {
    const grouped = {};
    activities.forEach((activity) => {
      const date = new Date(activity.processedAt).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <UserIcon size={48} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile?.name}</h2>
              <p className="text-sm opacity-80">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {["overview", "activity", "details"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 capitalize flex items-center space-x-2 ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab === "overview" && <Clock size={16} />}
              {tab === "activity" && <Activity size={16} />}
              {tab === "details" && <UserIcon size={16} />}
              <span>{tab}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-sm text-gray-600 mb-2">Processed Images</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {profile?.processedImages || 0}
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-sm text-gray-600 mb-2">Account Created</h3>
                <p className="text-lg">
                  {new Date(profile?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div>
              {Object.entries(groupActivitiesByDate(activities)).map(
                ([date, dayActivities]) => (
                  <div key={date} className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                      <Clock size={18} className="mr-2 text-gray-500" />
                      {date}
                    </h4>
                    {dayActivities.map((activity) => (
                      <div
                        key={activity._id}
                        className="flex items-center space-x-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition"
                      >
                        <div>{renderActivityIcon(activity.actionType)}</div>
                        <div className="flex-grow">
                          <p className="text-sm font-medium capitalize">
                            {activity.actionType.replace("-", " ")}
                          </p>
                          {activity.imageUrl && (
                            <p className="text-xs text-gray-500 truncate">
                              Image: {activity.imageUrl.split("/").pop()}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(activity.processedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium">{profile?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Last Active</label>
                  <p className="font-medium">
                    {new Date(profile?.lastActive).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
