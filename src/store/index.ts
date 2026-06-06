import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Drone, Policy, FlightTask, Accident, Material, Claim, Dispute, Survey } from '../types';
import { mockDrones, mockPolicies, mockFlightTasks, mockAccidents, mockMaterials, mockClaims, mockDisputes } from '../data/mockData';
import { generateId } from '../utils';

interface AppState {
  drones: Drone[];
  policies: Policy[];
  flightTasks: FlightTask[];
  accidents: Accident[];
  materials: Material[];
  claims: Claim[];
  disputes: Dispute[];
  surveys: Survey[];
  selectedAccidentId: string | null;
  selectedClaimId: string | null;
  
  setSelectedAccidentId: (id: string | null) => void;
  setSelectedClaimId: (id: string | null) => void;
  addDrone: (drone: Drone) => void;
  addPolicy: (policy: Policy) => void;
  addFlightTask: (task: FlightTask) => void;
  addAccident: (accident: Accident) => void;
  addMaterial: (material: Material) => void;
  addClaim: (claim: Claim) => void;
  addDispute: (dispute: Dispute) => void;
  addSurvey: (survey: Survey) => void;
  updateClaim: (claim: Claim) => void;
  updateAccident: (accident: Accident) => void;
  updateFlightTask: (task: FlightTask) => void;
  resetStore: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      drones: mockDrones,
      policies: mockPolicies,
      flightTasks: mockFlightTasks,
      accidents: mockAccidents,
      materials: mockMaterials,
      claims: mockClaims,
      disputes: mockDisputes,
      surveys: [],
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
      
      addClaim: (claim) => set((state) => ({
        claims: [...state.claims, claim]
      })),
      
      addDispute: (dispute) => set((state) => ({
        disputes: [...state.disputes, dispute]
      })),
      
      addSurvey: (survey) => set((state) => ({
        surveys: [...state.surveys, survey]
      })),
      
      updateClaim: (updatedClaim) => set((state) => ({
        claims: state.claims.map(c => c.id === updatedClaim.id ? updatedClaim : c)
      })),
      
      updateAccident: (updatedAccident) => set((state) => ({
        accidents: state.accidents.map(a => a.id === updatedAccident.id ? updatedAccident : a)
      })),
      
      updateFlightTask: (updatedTask) => set((state) => ({
        flightTasks: state.flightTasks.map(t => t.id === updatedTask.id ? updatedTask : t)
      })),
      
      resetStore: () => set({
        drones: mockDrones,
        policies: mockPolicies,
        flightTasks: mockFlightTasks,
        accidents: mockAccidents,
        materials: mockMaterials,
        claims: mockClaims,
        disputes: mockDisputes,
        surveys: [],
        selectedAccidentId: null,
        selectedClaimId: null
      })
    }),
    {
      name: 'insurance-platform-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        drones: state.drones,
        policies: state.policies,
        flightTasks: state.flightTasks,
        accidents: state.accidents,
        materials: state.materials,
        claims: state.claims,
        disputes: state.disputes,
        surveys: state.surveys
      }),
    }
  )
);

export { generateId };
