# Testing Get Directions Feature

## Quick Test Guide

### Scenario 1: Real Location (Your Actual Position)
1. Open http://localhost:3001
2. Query: "Find coffee shops near me" or "Find restaurants in [your city]"
3. Click "Directions" on any result
4. Click "Allow" when browser asks for location
5. ✅ Route should appear on map with distance/duration

### Scenario 2: Simulated Jakarta Location
**Setup:**
1. Open Chrome DevTools (F12)
2. Menu (⋮) → More tools → Sensors
3. Location → Other...
4. Enter: Latitude `-6.2088`, Longitude `106.8456`
5. Click "Manage"

**Test:**
1. Query: "Find restaurants in Jakarta"
2. Click "Directions" on any result
3. ✅ Route should show from Jakarta center to destination

### Scenario 3: Simulated Bandung Location
**Setup:**
1. Chrome DevTools → Sensors → Location → Other...
2. Enter: Latitude `-6.9175`, Longitude `107.6191`

**Test:**
1. Query: "Find hotels in Bandung"
2. Click "Directions" on any result
3. ✅ Route should show from Bandung center to hotel

### Scenario 4: Cross-City Directions
**Setup:**
1. Simulate location in Jakarta (see above)

**Test:**
1. Query: "Find beaches in Bali"
2. Click "Directions" on any beach
3. ✅ Route should show long distance (hundreds of km)

### Scenario 5: Location Permission Denied
**Test:**
1. Query: "Find museums in Jakarta"
2. Click "Directions"
3. Click "Block" when browser asks for location
4. ✅ Should show toast error: "Unable to get your location"

### Scenario 6: Open in Google Maps
**Test:**
1. Get directions (any scenario above)
2. Wait for route to appear
3. Click "Open in Google Maps" button in directions overlay
4. ✅ Google Maps should open in new tab with full directions

## Expected Results

### Success Indicators
- ✅ Blue route polyline appears on map
- ✅ Directions overlay shows at bottom-left
- ✅ Distance shown (e.g., "5.2 km")
- ✅ Duration shown (e.g., "12 mins")
- ✅ Turn-by-turn steps listed
- ✅ Map automatically zooms to fit route
- ✅ Original location markers hidden when showing route

### Error Scenarios

#### Location Denied
```
Toast: "Unable to get your location. Please enable location permissions."
```

#### API Failure (if Google Directions API not enabled)
```
Toast: "Failed to get directions. Please try again."
```

#### No Route Found
```
Toast: "No route found to this location."
```

## Chrome DevTools Sensors Panel

If you don't see the Sensors panel:

1. Open DevTools (F12)
2. Click **⋮** (three dots) in DevTools toolbar
3. **More tools** → **Sensors**
4. Panel should appear at bottom of DevTools

### Preset Locations Available:
- **Tokyo**: 35.6762, 139.6503
- **London**: 51.5074, -0.1278
- **San Francisco**: 37.7749, -122.4194
- **São Paulo**: -23.5505, -46.6333
- **Berlin**: 52.5200, 13.4050

### Custom Indonesian Locations:
- **Jakarta**: -6.2088, 106.8456
- **Bandung**: -6.9175, 107.6191
- **Surabaya**: -7.2575, 112.7521
- **Yogyakarta**: -7.7956, 110.3695
- **Bali (Denpasar)**: -8.6705, 115.2126

## Manual Testing Checklist

- [ ] Directions work with real location
- [ ] Directions work with simulated location
- [ ] Route polyline renders correctly
- [ ] Distance and duration display
- [ ] Turn-by-turn steps show
- [ ] "Open in Google Maps" button works
- [ ] Error handling when location denied
- [ ] Map zooms to fit entire route
- [ ] Loading spinner shows while calculating
- [ ] Can clear directions and query new locations

## Troubleshooting

### "Unable to get your location"
- **Cause**: Location permissions denied
- **Fix**: Click the lock icon in browser address bar → Allow location

### "Failed to get directions"
- **Cause**: Google Directions API not enabled or quota exceeded
- **Fix**: Enable Directions API in Google Cloud Console

### Route doesn't appear
- **Cause**: Origin and destination are the same
- **Fix**: Use Chrome DevTools to simulate different location

### Polyline is straight line
- **Cause**: Using airline distance instead of road route
- **Fix**: Check API response includes proper polyline encoding

## Video Walkthrough Simulation

1. **Start**: Open app, see empty map centered on Indonesia
2. **Query**: Type "Find restaurants in Jakarta" → Submit
3. **Results**: See 5-10 restaurant cards with map markers
4. **Setup Location**: DevTools → Sensors → Jakarta (-6.2088, 106.8456)
5. **Click Directions**: Click "Directions" on first restaurant
6. **Route Appears**: Blue line from Jakarta center to restaurant
7. **Overlay Shows**: Distance "2.5 km", Duration "8 mins"
8. **Steps Listed**: "Head north on Jl. Sudirman", etc.
9. **Open Maps**: Click "Open in Google Maps" → New tab opens
10. **Success**: Full Google Maps with directions loaded

## API Requirements

For this feature to work, you need:
- ✅ Google Maps JavaScript API (for map display)
- ✅ Google Directions API (for route calculation)
- ⚠️ Google Places API (for location search - needs to be enabled!)

Check status at: http://localhost:3001/api/health
