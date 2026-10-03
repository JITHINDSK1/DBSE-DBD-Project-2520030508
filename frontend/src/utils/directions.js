/**
 * Opens Google Maps directions for a given parking location.
 * Uses Google Maps Universal Directions URL format:
 * https://www.google.com/maps/dir/?api=1&destination=...&travelmode=driving
 */
export const openDirections = (parkingName, location) => {
  const parts = [parkingName, location].filter(Boolean).map(s => String(s).trim()).filter(Boolean);
  
  if (parts.length === 0) {
    alert('Location address is not available for this parking listing.');
    return;
  }

  const destination = parts.join(', ');
  const params = new URLSearchParams({
    api: '1',
    destination: destination,
    travelmode: 'driving'
  });

  const url = `https://www.google.com/maps/dir/?${params.toString()}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};
