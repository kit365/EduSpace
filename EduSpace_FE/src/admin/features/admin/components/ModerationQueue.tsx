import { Eye, CheckCircle, XCircle, Filter, Download } from 'lucide-react';
import { ModerationListing } from '../types';

interface ModerationQueueProps {
  listings: ModerationListing[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onView: (id: number) => void;
}

export function ModerationQueue({ listings, onApprove, onReject, onView }: ModerationQueueProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-bold mb-1">Pending Listing Approvals</h2>
            <p className="text-sm text-gray-600">Review and verify new classroom submissions from hosts.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Host Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Space Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Submission Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      listing.hostStatus === 'Verified Host' ? 'bg-blue-500' : 
                      listing.hostStatus === 'Member' ? 'bg-purple-500' : 'bg-gray-500'
                    }`}>
                      {listing.hostAvatar}
                    </div>
                    <div>
                      <div className="font-semibold">{listing.hostName}</div>
                      <div className="text-sm text-gray-600">
                        {listing.hostStatus}
                        {listing.hostSince && <span className="text-gray-400"> {listing.hostSince}</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium">{listing.spaceTitle}</div>
                  <div className={`text-sm ${
                    listing.listingType === 'Premium Listing' ? 'text-red-500' : 'text-gray-600'
                  }`}>
                    {listing.listingType}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {listing.submissionDate}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                    {listing.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onView(listing.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => onApprove(listing.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </button>
                    <button 
                      onClick={() => onReject(listing.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing 4 of 24 pending listings
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Previous
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
