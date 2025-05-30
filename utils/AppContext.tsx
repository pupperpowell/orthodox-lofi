import { signal } from "@preact/signals";

interface AppState {
  isOutside: boolean;
  isConnected: boolean;
  isRaining: boolean;
  isPlaying: boolean;
  isWindowOpen: boolean; // Added
  // Functions to be provided by AudioPlayer
  toggleWindow?: () => void;
  toggleRain?: () => void;
  toggleOutside?: () => void;
}

// Create signals for shared state
export const appState = signal<AppState>({
  isOutside: false,
  isConnected: false,
  isRaining: false,
  isPlaying: false,
  isWindowOpen: false, // Added
  toggleWindow: undefined,
  toggleRain: undefined,
  toggleOutside: undefined,
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

// Added setter for isWindowOpen
export const setIsWindowOpen = (value: boolean) => {
  appState.value = { ...appState.value, isWindowOpen: value };
};

// Added function to allow AudioPlayer to register its methods
export const registerAudioToggleFunctions = (toggles: {
  toggleWindow: () => void;
  toggleRain: () => void;
  toggleOutside: () => void;
}) => {
  appState.value = {
    ...appState.value,
    toggleWindow: toggles.toggleWindow,
    toggleRain: toggles.toggleRain,
    toggleOutside: toggles.toggleOutside,
  };
};
