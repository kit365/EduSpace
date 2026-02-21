import { Bell, AlertCircle, AlertTriangle } from 'lucide-react';

interface AdminHeaderProps {
  pendingReviews: number;
  reportedContent: number;
}

export function AdminHeader({ pendingReviews, reportedContent }: AdminHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content Moderation</h1>
        
        <div className="flex items-center gap-4">
          {/* Pending Reviews Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-semibold text-orange-700">
              {pendingReviews} Pending Reviews
            </span>
          </div>

          {/* Reported Content Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-semibold text-red-700">
              {reportedContent} Reported Content
            </span>
          </div>

          {/* Notifications */}
          <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
