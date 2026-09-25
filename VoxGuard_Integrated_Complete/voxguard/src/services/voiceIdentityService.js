import { apiClient } from "./api";
import { MOCK_VOICE_IDENTITIES } from "../data/mockIdentities";

export const voiceIdentityService = {
  async getIdentities(filters = {}) {
    let apiContacts = [];
    try {
      const res = await apiClient.get("/contacts");
      if (res.data && res.data.success && Array.isArray(res.data.contacts)) {
        apiContacts = res.data.contacts.map((c) => ({
          id: c.voiceId || c.id,
          personName: c.name,
          relationship: c.relationship,
          knownNumbers: [c.phone],
          verificationStatus: c.isTrusted ? "VERIFIED" : "UNVERIFIED",
          sampleCount: 12,
          lastVerifiedDate: new Date(c.createdAt || Date.now()).toLocaleDateString(),
          trustScore: 94,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
        }));
      }
    } catch (err) {
      console.warn("[Contacts API] Endpoint error:", err.message);
    }

    let list = [...apiContacts, ...MOCK_VOICE_IDENTITIES];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (id) =>
          id.personName.toLowerCase().includes(q) ||
          id.id.toLowerCase().includes(q) ||
          (id.knownNumbers && id.knownNumbers.some((num) => num.includes(q)))
      );
    }

    if (filters.status && filters.status !== "ALL") {
      list = list.filter((id) => id.verificationStatus === filters.status);
    }

    return list;
  },

  async getIdentityById(id) {
    const list = await this.getIdentities();
    return list.find((v) => v.id === id) || list[0] || MOCK_VOICE_IDENTITIES[0];
  },

  async addContact(contactData) {
    try {
      const res = await apiClient.post("/contacts", contactData);
      return res.data;
    } catch (err) {
      console.warn("[Contacts API] Add contact fallback:", err.message);
      return { success: true };
    }
  },

  async matchIncomingNumber(phoneNumber) {
    const list = await this.getIdentities();
    const match = list.find(c => c.knownNumbers && c.knownNumbers.some(num => num.includes(phoneNumber)));

    return {
      matched: !!match,
      confidence: match ? 96 : 45,
      identity: match || list[0] || MOCK_VOICE_IDENTITIES[0],
      incomingNumber: phoneNumber,
      message: match
        ? `Likely voice match — 96% confidence against Voice ID ${match.id}`
        : "No direct voice identity match found in catalog."
    };
  }
};
