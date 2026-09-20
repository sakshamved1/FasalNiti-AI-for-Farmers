import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { 
  getAllStates, 
  getDistrictsForState, 
  isValidDistrict 
} from '../data/locationMaster';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const { user } = useAuth();

  // Load initial state and district from user profile, saved preference, or default
  const [selectedState, setSelectedState] = useState(() => {
    return localStorage.getItem('kisansetu_state') || 'Madhya Pradesh';
  });

  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    const saved = localStorage.getItem('kisansetu_district') || 'Indore';
    const state = localStorage.getItem('kisansetu_state') || 'Madhya Pradesh';
    const valid = isValidDistrict(state, saved);
    if (valid) return saved;
    const list = getDistrictsForState(state);
    return list[0] || 'Indore';
  });

  // Synchronously initialize states and districts from location master
  const [states, setStates] = useState(() => getAllStates());
  const [districts, setDistricts] = useState(() => {
    const initial = localStorage.getItem('kisansetu_state') || 'Madhya Pradesh';
    return getDistrictsForState(initial);
  });
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // When authenticated user changes, sync their profile location if available
  useEffect(() => {
    if (user?.state && user.state !== 'National') {
      setSelectedState(user.state);
      localStorage.setItem('kisansetu_state', user.state);
      const userDistricts = getDistrictsForState(user.state);
      setDistricts(userDistricts);

      if (user?.district && user.district !== 'New Delhi') {
        setSelectedDistrict(user.district);
        localStorage.setItem('kisansetu_district', user.district);
      } else if (userDistricts.length > 0) {
        setSelectedDistrict(userDistricts[0]);
        localStorage.setItem('kisansetu_district', userDistricts[0]);
      }
    }
  }, [user]);

  // Synchronize districts whenever selectedState changes
  useEffect(() => {
    const list = getDistrictsForState(selectedState);
    if (list.length > 0) {
      setDistricts(list);
      // If current district does not belong to this state, immediately set first district
      if (!list.includes(selectedDistrict)) {
        const first = list[0];
        setSelectedDistrict(first);
        localStorage.setItem('kisansetu_district', first);
      }
    }
  }, [selectedState]);

  // Set State handler: immediately switches state and sets first district of that state
  const handleSetSelectedState = (newState) => {
    if (!newState) return;
    setSelectedState(newState);
    localStorage.setItem('kisansetu_state', newState);

    const stateDistricts = getDistrictsForState(newState);
    setDistricts(stateDistricts);

    if (stateDistricts.length > 0 && !stateDistricts.includes(selectedDistrict)) {
      const nextDistrict = stateDistricts[0];
      setSelectedDistrict(nextDistrict);
      localStorage.setItem('kisansetu_district', nextDistrict);
    }
  };

  // Set District handler: ensures district is strictly part of current selectedState
  const handleSetSelectedDistrict = (newDistrict) => {
    if (!newDistrict) return;
    setSelectedDistrict(newDistrict);
    localStorage.setItem('kisansetu_district', newDistrict);
  };

  // Explicit location changer for modals and selectors
  const setLocation = (state, district) => {
    if (!state) return;
    setSelectedState(state);
    localStorage.setItem('kisansetu_state', state);

    const available = getDistrictsForState(state);
    setDistricts(available);

    const finalDistrict = available.includes(district) ? district : (available[0] || district);
    setSelectedDistrict(finalDistrict);
    localStorage.setItem('kisansetu_district', finalDistrict);
  };

  return (
    <LocationContext.Provider
      value={{
        selectedState,
        selectedDistrict,
        setSelectedState: handleSetSelectedState,
        setSelectedDistrict: handleSetSelectedDistrict,
        setLocation,
        states,
        districts,
        loadingStates,
        loadingDistricts,
        getDistrictsForState
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
