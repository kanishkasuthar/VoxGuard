import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUsers, FiPlus, FiCheckCircle, FiClock, FiPhone, FiShield, FiX, FiSearch } from "react-icons/fi";
import { useToast } from "../../context/NotificationContext";
import { useCall } from "../../context/CallContext";

export const TrustedContactsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { initiateCall } = useCall();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [contacts, setContacts] = useState([
    {
      id: "tc-001",
      name: "Mom",
      relationship: "Family",
      phone: "+91 98765 43210",
      status: "Verified",
      voiceId: "VG-008",
      avatarBg: "bg-emerald-100 text-emerald-800",
      lastCall: "Today, 08:30 AM",
      verifiedDate: "10 Aug 2026"
    },
    {
      id: "tc-002",
      name: "Dad",
      relationship: "Family",
      phone: "+91 98765 43211",
      status: "Verified",
      voiceId: "VG-009",
      avatarBg: "bg-blue-100 text-blue-800",
      lastCall: "Yesterday, 07:15 PM",
      verifiedDate: "12 Aug 2026"
    },
    {
      id: "tc-003",
      name: "Best Friend",
      relationship: "Friend",
      phone: "+91 98765 43212",
      status: "Pending",
      voiceId: "VG-PENDING",
      avatarBg: "bg-amber-100 text-amber-800",
      lastCall: "3 days ago",
      verifiedDate: "Enrolment Required"
    },
    {
      id: "tc-004",
      name: "Office HR",
      relationship: "Work",
      phone: "+91 98765 43213",
      status: "Verified",
      voiceId: "VG-005",
      avatarBg: "bg-purple-100 text-purple-800",
      lastCall: "12 Sep 2026",
      verifiedDate: "01 Sep 2026"
    }
  ]);

  const [newContact, setNewContact] = useState({
    name: "",
    relationship: "Family",
    phone: ""
  });

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) {
      addToast("Please fill in contact name and phone number.", "warning");
      return;
    }

    const created = {
      id: `tc-00${contacts.length + 1}`,
      name: newContact.name,
      relationship: newContact.relationship,
      phone: newContact.phone,
      status: "Pending",
      voiceId: "VG-PENDING",
      avatarBg: "bg-[#EEF7FA] text-[#0B3047]",
      lastCall: "Never",
      verifiedDate: "Enrolment Sent"
    };

    setContacts([created, ...contacts]);
    setShowAddModal(false);
    setNewContact({ name: "", relationship: "Family", phone: "" });
    addToast(`Added ${created.name} to Trusted Contacts. Enrolment link sent.`, "success");
  };

  const handleVerify = (contactName) => {
    addToast(`Triggered voice verification enrolment for ${contactName}.`, "info");
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.relationship.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D8E3E8]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-[#123F59]">
            <FiShield /> VERIFIED PERSONA CATALOG
          </div>
          <h1 className="text-3xl font-serif text-[#0B3047] tracking-tight">
            Trusted Contacts
          </h1>
          <p className="text-xs text-[#66737C]">
            People you trust associated with verified VoxGuard voice identities.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#0B3047] hover:bg-[#123F59] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <FiPlus className="text-base" /> Add Contact
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#D8E3E8]">
        <FiSearch className="text-[#66737C] text-base ml-2 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, relationship, or phone number..."
          className="w-full text-xs font-sans bg-transparent border-none outline-none text-[#0B3047] placeholder-[#66737C]"
        />
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white p-5 rounded-2xl border border-[#D8E3E8] space-y-4 shadow-2xs hover:border-[#123F59]/30 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base ${contact.avatarBg}`}>
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0B3047] text-base leading-tight">
                      {contact.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#66737C] font-mono">{contact.relationship}</span>
                      <span className="text-[#D8E3E8]">•</span>
                      <span className="text-xs text-[#66737C] font-mono">{contact.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                {contact.status === "Verified" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#3FA66B] border border-emerald-200 text-[10px] font-mono font-bold uppercase">
                    <FiCheckCircle /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-[#E8A23A] border border-amber-200 text-[10px] font-mono font-bold uppercase">
                    <FiClock /> Pending
                  </span>
                )}
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8] flex items-center justify-between text-xs font-mono">
                <span className="text-[#66737C]">VOICE IDENTITY:</span>
                <span className="font-bold text-[#0B3047]">{contact.voiceId}</span>
              </div>
            </div>

            {/* Card Actions */}
            <div className="pt-2 border-t border-[#D8E3E8] flex items-center justify-between font-sans text-xs">
              <span className="text-[11px] text-[#66737C] font-mono">
                Last Call: {contact.lastCall}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    initiateCall({
                      id: contact.id || "USR-B-1042",
                      name: contact.name,
                      phone: contact.phone,
                      relationship: contact.relationship
                    });
                    navigate("/incoming-call");
                  }}
                  className="px-3 py-1.5 bg-[#3FA66B] hover:bg-emerald-600 text-white font-mono font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <FiPhone className="text-xs" /> CALL
                </button>
                {contact.status === "Verified" ? (
                  <Link
                    to={`/voice-identities/${contact.voiceId}`}
                    className="px-3 py-1.5 bg-[#EEF7FA] hover:bg-[#DCECF4] text-[#0B3047] font-bold rounded-lg border border-[#D8E3E8] transition-colors"
                  >
                    Profile
                  </Link>
                ) : (
                  <button
                    onClick={() => handleVerify(contact.name)}
                    className="px-3 py-1.5 bg-[#0B3047] hover:bg-[#123F59] text-white font-bold rounded-lg transition-colors"
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#0B3047]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl border border-[#D8E3E8] p-6 space-y-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#D8E3E8] pb-4">
              <div className="flex items-center gap-2">
                <FiUsers className="text-[#0B3047] text-lg" />
                <h3 className="font-serif text-xl font-bold text-[#0B3047]">
                  Add Trusted Contact
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#66737C] hover:text-[#0B3047] p-1 rounded-lg hover:bg-[#FAF7F2]"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-[#0B3047] uppercase">
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sister / Rahul / HR Office"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8] text-xs font-sans text-[#0B3047] focus:outline-none focus:border-[#0B3047]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-[#0B3047] uppercase">
                  Relationship Tag
                </label>
                <select
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8] text-xs font-sans text-[#0B3047] focus:outline-none focus:border-[#0B3047]"
                >
                  <option value="Family">Family</option>
                  <option value="Friend">Friend</option>
                  <option value="Work">Work</option>
                  <option value="Bank / Financial">Bank / Financial</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-[#0B3047] uppercase">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 XXXXX XXXXX"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8] text-xs font-sans text-[#0B3047] focus:outline-none focus:border-[#0B3047]"
                />
              </div>

              <div className="p-3 bg-[#EEF7FA] rounded-xl border border-[#DCECF4] text-xs font-sans text-[#0B3047]">
                <p className="font-bold">Voice Identity Linking:</p>
                <p className="text-[11px] text-[#66737C] mt-0.5">
                  VoxGuard will send an automated voice enrolment invite to collect a 10-second reference audio sample.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D8E3E8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#66737C] hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B3047] hover:bg-[#123F59] text-white font-bold text-xs rounded-xl shadow-2xs"
                >
                  Save & Request Enrolment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
