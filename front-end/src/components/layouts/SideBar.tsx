export default function SideBar() {
  return (
    <aside className="w-80 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <div className="space-y-2 mb-6">
          <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded text-blue-700 cursor-pointer">
            <div
              className="flex items-center justify-center"
              style={{ width: 24, height: 24, cursor: "default" }}
            >
              <svg
                className="inline-block w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
              </svg>
            </div>
            <span className="font-medium">Dashboard</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
