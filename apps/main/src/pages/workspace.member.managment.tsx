import React from "react";

interface Member {
  name: string;
  handle: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
  avatarUrl: string;
  action: "Leave" | "Remove";
}

const members: Member[] = [
  {
    name: "Douzi Hazem",
    handle: "@douzihazem",
    email: "hz.douzi20@gmail.com",
    role: "Admin",
    status: "Active",
    lastActive: "August 18 2025",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    action: "Leave",
  },
  {
    name: "Charf",
    handle: "@charfred",
    email: "charf@example.com",
    role: "Admin",
    status: "Active",
    lastActive: "August 2025",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
    action: "Remove",
  },
  {
    name: "Bassem d",
    handle: "",
    email: "bassem@example.com",
    role: "Admin",
    status: "Active",
    lastActive: "August 2025",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    action: "Remove",
  },
];

const WorkspaceMemberManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-6 font-sans">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">workspace member management</h1>

      {/* Alert Box */}
      <div className="bg-cyan-900/30 border-l-4 border-cyan-500 text-cyan-300 p-3 rounded mb-6 text-sm">
        You are the only owner of this account. We suggest you add another admin...
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <input
          type="text"
          placeholder="Search user name / email"
          className="bg-[#1c1c1c] text-white placeholder-gray-400 px-4 py-2 rounded w-full md:w-1/2"
        />
        <select className="bg-[#1c1c1c] text-white px-4 py-2 rounded ml-0 md:ml-4">
          <option>All Roles</option>
        </select>
      </div>

      {/* Members Table */}
      <div className="bg-[#1c1c1c] border border-gray-700 rounded p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Workspace Members ({members.length})</h2>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-4 py-2 rounded">
            + Invite Workspace members
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Workspace members can view and join all Workspace visible boards and create new boards in the Workspace.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="py-2">Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="py-3 flex items-center space-x-3">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="text-white">{member.name}</div>
                      {member.handle && (
                        <div className="text-gray-500 text-xs">{member.handle}</div>
                      )}
                    </div>
                  </td>
                  <td>{member.email}</td>
                  <td>
                    <span className="bg-blue-600 text-white px-2 py-1 text-xs rounded">
                      {member.role}
                    </span>
                  </td>
                  <td>
                    <span className="text-green-400 font-medium">{member.status}</span>
                  </td>
                  <td>{member.lastActive}</td>
                  <td className="space-x-2">
                    <button className="bg-gray-700 border border-gray-600 text-white text-xs px-3 py-1 rounded">
                      View Boards (0)
                    </button>
                    <button className="bg-red-600 text-white text-xs px-3 py-1 rounded">
                      {member.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Section */}
      <div className="bg-[#1c1c1c] border border-gray-700 rounded p-4 mb-6">
        <h2 className="text-sm font-semibold mb-2">Invite members to join you</h2>

        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded p-4 text-white flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="mb-2 md:mb-0">
            <div className="font-semibold">Upgrade for more permissions controls</div>
            <div className="text-sm">Get advanced member management features</div>
          </div>
          <button className="bg-white text-blue-600 font-bold px-4 py-2 rounded text-sm">
            Try Premium free for 14 days
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button className="bg-emerald-500 text-white px-4 py-2 rounded text-sm">
            Invite with link
          </button>
          <button className="bg-gray-700 text-white px-4 py-2 rounded text-sm">
            Disable invite link
          </button>
          <input
            type="text"
            placeholder="Filter by name"
            className="bg-[#1c1c1c] border border-gray-600 text-white px-3 py-2 rounded text-sm w-full md:max-w-xs md:ml-auto"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="bg-[#1c1c1c] border border-gray-700 rounded p-4 mb-6">
        <h2 className="text-sm font-semibold mb-1">Guests (0)</h2>
        <p className="text-gray-400 text-sm">No guests in this workspace</p>
      </div>

      {/* Join Requests */}
      <div className="bg-[#1c1c1c] border border-gray-700 rounded p-4">
        <h2 className="text-sm font-semibold mb-1">Join requests (0)</h2>
        <p className="text-gray-400 text-sm">No pending join requests</p>
      </div>
    </div>
  );
};

export default WorkspaceMemberManagement;
