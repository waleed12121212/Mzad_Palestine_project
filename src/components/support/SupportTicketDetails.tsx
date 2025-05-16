import React, { useEffect, useState } from 'react';
import SupportForm from './SupportForm';
import SupportReplyForm from './SupportReplyForm';
import SupportStatusDropdown from './SupportStatusDropdown';
import supportService from '@/services/supportService';

interface AdminResponse {
  text: string;
  date: string;
}

interface SupportTicketDetailsProps {
  ticketId?: string;
  currentStatus?: 'Open' | 'Pending' | 'Closed' | number;
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
  const [ticketDetails, setTicketDetails] = useState<{
    subject?: string;
    description?: string;
    userDescription?: string;
    adminResponses?: AdminResponse[];
  }>({});
  const [loading, setLoading] = useState(false);

  // Only show admin features if explicitly passed 'Admin' role
  const isAdmin = userRole === 'Admin';

  useEffect(() => {
    if (ticketId) {
      loadTicketDetails();
    } else {
      setTicketDetails({});
    }
  }, [ticketId]);

  const loadTicketDetails = async () => {
    if (!ticketId) return;
    
    try {
      setLoading(true);
      let details;
      
      try {
        details = await supportService.getTicketDetails(ticketId);
      } catch (e) {
        console.error('Error fetching ticket details:', e);
        return;
      }
      
      if (details) {
        const { userDescription, adminResponses } = parseAdminResponses(details.description || '');
        setTicketDetails({
          ...details,
          userDescription,
          adminResponses
        });
      }
    } catch (error) {
      console.error('Failed to load ticket details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Parse admin responses from the description field
  const parseAdminResponses = (description: string): { userDescription: string, adminResponses: AdminResponse[] } => {
    if (!description) return { userDescription: '', adminResponses: [] };
    
    const regex = /Admin Response \(([^)]+)\):\s*([^]*?)(?=Admin Response \(|$)/g;
    let match;
    const adminResponses: AdminResponse[] = [];
    let userDescription = description;

    // Find all admin responses
    while ((match = regex.exec(description)) !== null) {
      adminResponses.push({
        date: match[1],
        text: match[2].trim()
      });
    }

    // Remove admin responses from the user description
    if (adminResponses.length > 0) {
      const firstResponseIndex = description.indexOf('Admin Response (');
      if (firstResponseIndex > -1) {
        userDescription = description.substring(0, firstResponseIndex).trim();
      }
    }

    return { userDescription, adminResponses };
  };

  // Convert numeric status to string status for the dropdown
  const getStatusValue = (status: 'Open' | 'Pending' | 'Closed' | number): 'Open' | 'Pending' | 'Closed' => {
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'Open';
        case 1: return 'Pending';
        case 2: return 'Closed';
        default: return 'Open';
      }
    }
    return status as 'Open' | 'Pending' | 'Closed';
  };

  return (
    <div className="space-y-6 p-4">
      {/* Selected Ticket Details */}
      {ticketId && ticketDetails.subject && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">{ticketDetails.subject}</h2>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* User Description */}
              {ticketDetails.userDescription && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">وصف المشكلة:</h3>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {ticketDetails.userDescription}
                  </p>
                </div>
              )}
              
              {/* Admin Responses */}
              {ticketDetails.adminResponses && ticketDetails.adminResponses.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">ردود الإدارة:</h3>
                  {ticketDetails.adminResponses.map((response, index) => (
                    <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          رد الإدارة
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {response.date}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {response.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Admin Only Section - Only shown if userRole is explicitly 'Admin' */}
      {isAdmin && ticketId && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">الرد على التذكرة</h2>
            <SupportReplyForm 
              ticketId={ticketId} 
              userRole={userRole}
              onResponseAdded={onStatusChanged}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">حالة التذكرة</h2>
            <SupportStatusDropdown
              ticketId={ticketId}
              currentStatus={getStatusValue(currentStatus)}
              userRole={userRole}
              onStatusChanged={onStatusChanged}
            />
          </div>
        </>
      )}

      {/* New Ticket Form - Always visible */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">إنشاء تذكرة دعم جديدة</h2>
        <SupportForm onTicketCreated={onTicketCreated} />
      </div>
    </div>
  );
};

export default SupportTicketDetails; 