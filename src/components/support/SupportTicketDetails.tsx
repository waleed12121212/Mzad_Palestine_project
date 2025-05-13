import React from 'react';
import SupportForm from './SupportForm';
import SupportReplyForm from './SupportReplyForm';
import SupportStatusDropdown from './SupportStatusDropdown';

interface SupportTicketDetailsProps {
  ticketId?: string;
  currentStatus?: 'Open' | 'Pending' | 'Closed';
  userRole?: string;
  onTicketCreated?: () => void;
  onStatusChanged?: () => void;
}

const SupportTicketDetails: React.FC<SupportTicketDetailsProps> = ({
  ticketId,
  currentStatus = 'Open',
  userRole,
  onTicketCreated,
  onStatusChanged
}) => {
  return (
    <div className="space-y-6 p-4">
      {/* New Ticket Form - Always visible */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">إنشاء تذكرة دعم جديدة</h2>
        <SupportForm onTicketCreated={onTicketCreated} />
      </div>

      {/* Admin Only Section */}
      {userRole === 'Admin' && ticketId && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">الرد على التذكرة</h2>
            <SupportReplyForm 
              ticketId={ticketId} 
              userRole={userRole}
              onResponseAdded={onStatusChanged}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">حالة التذكرة</h2>
            <SupportStatusDropdown
              ticketId={ticketId}
              currentStatus={currentStatus}
              userRole={userRole}
              onStatusChanged={onStatusChanged}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SupportTicketDetails; 