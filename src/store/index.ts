import { create } from 'zustand';
import type { Drone, Policy, FlightTask, Accident, Material, Claim, Dispute } from '../types';
import { mockDrones, mockPolicies, mockFlightTasks, mockAccidents, mockMaterials, mockClaims, mockDisputes } from '../data/mockData';

interface AppState {
  drones: Drone[];
  policies: Policy[];
  flightTasks: FlightTask[];
  accidents: Accident[];
  materials: Material[];
  claims: Claim[];
  disputes: Dispute[];
  selectedAccidentId: string | null;
  selectedClaimId: string | null;
  
  setSelectedAccidentId: (id: string | null) => void;
  setSelectedClaimId: (id: string | null) => void;
  addDrone: (drone: Drone) => void;
  addPolicy: (policy: Policy) => void;
  addFlightTask: (task: FlightTask) => void;
  addAccident: (accident: Accident) => void;
  addMaterial: (material: Material) => void;
  updateClaim: (claim: Claim) => void;
}

export const useAppStore = create<AppState>((set) => ({
  drones: mockDrones,
  policies: mockPolicies,
  flightTasks: mockFlightTasks,
  accidents: mockAccidents,
  materials: mockMaterials,
  claims: mockClaims,
  disputes: mockDisputes,
  selectedAccidentId: null,
  selectedClaimId: null,
  
  setSelectedAccidentId: (id) => set({ selectedAccidentId: id }),
  setSelectedClaimId: (id) => set({ selectedClaimId: id }),
  
  addDrone: (drone) => set((state) => ({
    drones: [...state.drones, drone]
  })),
  
  addPolicy: (policy) => set((state) => ({
    policies: [...state.policies, policy]
  })),
  
  addFlightTask: (task) => set((state) => ({
    flightTasks: [...state.flightTasks, task]
  })),
  
  addAccident: (accident) => set((state) => ({
    accidents: [...state.accidents, accident]
  })),
  
  addMaterial: (material) => set((state) => ({
    materials: [...state.materials, material]
  })),
  
  updateClaim: (updatedClaim) => set((state) => ({
    claims: state.claims.map(c => c.id === updatedClaim.id ? updatedClaim : c)
  }))
}));
