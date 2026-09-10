import { base44 } from "@/api/base44Client";

// ---------------- Wallet ----------------

export const getMyWallet = () => base44.get("/wallet/me");
export const getChildWallet = (childId) => base44.get(`/wallet/child/${childId}`);
export const updateChildLimits = (childId, payload) => base44.patch(`/wallet/child/${childId}/limits`, payload);
export const updateCardStatus = (childId, cardStatus) =>
  base44.patch(`/wallet/child/${childId}/card-status`, { card_status: cardStatus });
export const sendAllowance = (childId, amount, label) =>
  base44.post(`/wallet/child/${childId}/allowance`, { amount, label });

// ---------------- Savings goals ----------------

export const createSavingsGoal = (payload) => base44.post("/wallet/me/goals", payload);
export const depositToGoal = (goalId, amount) => base44.post(`/wallet/me/goals/${goalId}/deposit`, { amount });

// ---------------- Missions ----------------

export const createMission = (payload) => base44.post("/missions", payload);
export const requestRedemption = (payload) => base44.post("/missions/redeem", payload);
export const submitMission = (missionId) => base44.post(`/missions/${missionId}/submit`, {});
export const reviewMission = (missionId, decision, note) =>
  base44.post(`/missions/${missionId}/review`, { decision, note });

export const getMyMissions = (status) => base44.get(`/missions/mine${status ? `?status=${status}` : ""}`);
export const getFamilyMissions = ({ childId, status } = {}) => {
  const params = new URLSearchParams();
  if (childId) params.set("child_id", childId);
  if (status) params.set("status", status);
  const qs = params.toString();
  return base44.get(`/missions/family${qs ? `?${qs}` : ""}`);
};

// ---------------- Transactions ----------------

export const getMyTransactions = () => base44.get("/transactions/mine");
export const getChildTransactions = (childId) => base44.get(`/transactions/child/${childId}`);