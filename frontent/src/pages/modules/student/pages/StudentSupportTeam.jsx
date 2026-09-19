import React, { useState } from "react";
import { FaTicketAlt, FaLifeRing } from "react-icons/fa";
import SupportDepartmentLanding from "../../../../components/SupportDepartmentLanding";
import CreateSupportTicketModal from "../../../../components/CreateSupportTicketModal";
import RequesterTicketHistory from "../../../../components/RequesterTicketHistory";

export default function StudentSupportTeam() {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleModalClose = () => {
    setIsTicketModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
            <FaLifeRing />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">TeachHub Support Team</h1>
            <p className="text-xs text-white/80 font-semibold mt-0.5">
              Official TeachHub platform assistance for onboarding and technical issues.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedDepartment(null);
            setIsTicketModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-white text-[#7C3AED] hover:bg-slate-100 font-extrabold text-xs shadow-md transition shrink-0 cursor-pointer flex items-center gap-2"
        >
          <FaTicketAlt />
          <span>+ Create Support Ticket</span>
        </button>
      </div>

      {/* Department Selection Landing */}
      <SupportDepartmentLanding
        hideBilling={true}
        onSelectDepartment={(dept) => {
          setSelectedDepartment(dept);
          setIsTicketModalOpen(true);
        }}
      />

      {/* Requester Ticket History */}
      <RequesterTicketHistory refreshTrigger={refreshTrigger} />

      <CreateSupportTicketModal
        isOpen={isTicketModalOpen}
        hideBilling={true}
        initialDepartment={selectedDepartment}
        onClose={handleModalClose}
      />
    </div>
  );
}
