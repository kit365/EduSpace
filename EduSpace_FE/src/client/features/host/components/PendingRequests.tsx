import { MapPin, Clock } from 'lucide-react';
import { BookingRequest } from '../types';

interface PendingRequestsProps {
  requests: BookingRequest[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export function PendingRequests({ requests, onApprove, onReject }: PendingRequestsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Pending Requests</h2>
        <button className="text-red-500 hover:text-red-600 font-semibold">
          View All
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="border border-gray-200 rounded-lg p-4">
            {/* Guest Info */}
            <div className="flex items-start gap-4 mb-4">
              <img
                src={request.guestAvatar}
                alt={request.guestName}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <div className="font-semibold">{request.guestName}</div>
                    <div className="text-sm text-gray-500">{request.guestType}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-500">{request.revenue}</div>
                  </div>
                </div>
                
                {/* Booking Details */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{request.spaceName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{request.date}, {request.time}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(request.id)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(request.id)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
