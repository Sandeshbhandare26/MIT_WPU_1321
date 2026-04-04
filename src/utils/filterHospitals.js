/**
 * hospitalFiltering.js - Smart hospital selection logic
 * Filter hospitals based on patient severity and hospital capabilities.
 */

export function filterHospitals(hospitals, severity) {
  if (!hospitals || hospitals.length === 0) return [];

  // Logic: In "HIGH" severity (RED/CRITICAL), ONLY return Level-1 Trauma Centers
  if (severity === "HIGH" || severity === "RED" || severity === "CRITICAL") {
    const filtered = hospitals.filter(h => h.traumaLevel === 1 || h.isLevel1);
    
    // If no Level-1 found (edge case), return all sorted by proximity as fallback
    return filtered.length > 0 ? filtered : hospitals;
  }

  // Otherwise, return all hospitals (standard sorting applies)
  return hospitals;
}
