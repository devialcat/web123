import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocationStore {
  id: string;
  nameEn: string;
  nameVi: string;
  nameKo: string;
  imageUrl: string;
  city: 'da-nang' | 'hue' | 'hoi-an';
}

export interface ItineraryStop {
  locationId: string;
  location?: LocationStore;
  order: number;
}

export interface ItineraryDay {
  day: number;
  stops: ItineraryStop[];
}

interface ItineraryState {
  startDate: Date | null;
  endDate: Date | null;
  peopleCount: number;
  selectedLocations: LocationStore[];
  days: ItineraryDay[];
  setDates: (start: Date | null, end: Date | null) => void;
  setPeopleCount: (count: number) => void;
  addLocation: (location: LocationStore) => void;
  removeLocation: (locationId: string) => void;
  assignStopToDay: (locationId: string, day: number) => void;
  reorderStops: (day: number, stops: ItineraryStop[]) => void;
  unassignedStops: LocationStore[];
  clearItinerary: () => void;
}

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set, get) => ({
      startDate: null,
      endDate: null,
      peopleCount: 2,
      selectedLocations: [],
      days: [],

      setDates: (start, end) => set({ startDate: start, endDate: end }),
      
      setPeopleCount: (count) => set({ peopleCount: count }),

      addLocation: (location) => set((state) => {
        if (state.selectedLocations.some(l => l.id === location.id)) {
          return state;
        }
        return { selectedLocations: [...state.selectedLocations, location] };
      }),

      removeLocation: (locationId) => set((state) => ({
        selectedLocations: state.selectedLocations.filter(l => l.id !== locationId),
        days: state.days.map(day => ({
          ...day,
          stops: day.stops.filter(s => s.locationId !== locationId)
        })).filter(day => day.stops.length > 0 || day.day <= (state.days.length))
      })),

      assignStopToDay: (locationId, targetDay) => set((state) => {
        // Remove from current day if it exists
        let newDays = state.days.map(d => ({
          ...d,
          stops: d.stops.filter(s => s.locationId !== locationId)
        }));

        // Find or create target day
        let targetDayObj = newDays.find(d => d.day === targetDay);
        if (!targetDayObj) {
          targetDayObj = { day: targetDay, stops: [] };
          newDays.push(targetDayObj);
        }

        // Get location info
        const location = state.selectedLocations.find(l => l.id === locationId);
        
        // Add to target day
        targetDayObj.stops.push({
          locationId,
          location,
          order: targetDayObj.stops.length
        });

        // Ensure days are sorted
        newDays.sort((a, b) => a.day - b.day);

        return { days: newDays };
      }),

      reorderStops: (day, newStops) => set((state) => ({
        days: state.days.map(d => 
          d.day === day ? { ...d, stops: newStops.map((s, i) => ({ ...s, order: i })) } : d
        )
      })),

      get unassignedStops() {
        const state = get();
        const assignedIds = new Set(state.days.flatMap(d => d.stops.map(s => s.locationId)));
        return state.selectedLocations.filter(l => !assignedIds.has(l.id));
      },

      clearItinerary: () => set({
        startDate: null,
        endDate: null,
        peopleCount: 2,
        selectedLocations: [],
        days: []
      })
    }),
    {
      name: 'itinerary-storage',
      // Convert Date objects correctly
      serialize: (state) => JSON.stringify({
        ...state,
        state: {
          ...state.state,
          startDate: state.state.startDate?.toISOString(),
          endDate: state.state.endDate?.toISOString()
        }
      }),
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        if (parsed.state) {
          parsed.state.startDate = parsed.state.startDate ? new Date(parsed.state.startDate) : null;
          parsed.state.endDate = parsed.state.endDate ? new Date(parsed.state.endDate) : null;
        }
        return parsed;
      }
    }
  )
);
