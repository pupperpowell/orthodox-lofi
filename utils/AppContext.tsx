import { signal } from "@preact/signals";

interface AppState {
  isOutside: boolean;
  isConnected: boolean;
  isRaining: boolean;
  isPlaying: boolean;
}

// Create signals for shared state
export const appState = signal<AppState>({
  isOutside: false,
  isConnected: false,
  isRaining: false,
  isPlaying: false,
});

// Helper functions to update individual state properties
export const setIsOutside = (value: boolean) => {
  appState.value = { ...appState.value, isOutside: value };
};

export const setIsConnected = (value: boolean) => {
  appState.value = { ...appState.value, isConnected: value };
};

export const setIsRaining = (value: boolean) => {
  appState.value = { ...appState.value, isRaining: value };
};

export const setIsPlaying = (value: boolean) => {
  appState.value = { ...appState.value, isPlaying: value };
};
