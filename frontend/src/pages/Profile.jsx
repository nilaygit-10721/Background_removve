import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch user profile
        const profileResponse = await axios.get(
          "http://localhost:3000/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch user activities
        const activitiesResponse = await axios.get(
          "http://localhost:3000/api/users/activity",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProfile(profileResponse.data.data);
        setActivities(activitiesResponse.data.data);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch profile data");
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">User Profile</h2>

        {profile && (
          <div className="space-y-4">
            <div>
              <strong>Name:</strong> {profile.name}
            </div>
            <div>
              <strong>Email:</strong> {profile.email}
            </div>
            <div>
              <strong>Processed Images:</strong> {profile.processedImages}
            </div>
            <div>
              <strong>Account Created:</strong>{" "}
              {new Date(profile.createdAt).toLocaleDateString()}
            </div>
            <div>
              <strong>Last Active:</strong>{" "}
              {new Date(profile.lastActive).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        {activities.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Action</th>
                <th className="py-2 px-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity._id} className="border-b">
                  <td className="py-2 px-4">{activity.actionType}</td>
                  <td className="py-2 px-4">
                    {new Date(activity.processedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No recent activities</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
