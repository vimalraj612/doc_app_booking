# URL Parameters Guide

## Doctor Selection via URL

You can pre-select a doctor for patients by adding a URL parameter:

### Usage

Add `?doctor=DOCTOR_ID` to the URL to automatically display doctor information and available slots on the patient dashboard.

### Examples

```
http://localhost:3000?doctor=d1
```
This will show Dr. Sarah Johnson (Cardiology) with all available appointment slots.

```
http://localhost:3000?doctor=d2
```
This will show Dr. Michael Chen (Neurology) with all available appointment slots.

### Available Doctor IDs

- `d1` - Dr. Sarah Johnson (Cardiology)
- `d2` - Dr. Michael Chen (Neurology)
- `d3` - Dr. Emily Williams (Pediatrics)
- `d4` - Dr. James Brown (Orthopedics)

### Features When Doctor is Selected

When a doctor is selected via URL:
1. **Doctor Profile Card** - Shows prominently after the header with:
   - Doctor's photo and full name
   - Specialization and hospital location
   - Count of available appointment slots

2. **Available Slots Display** - All free appointment slots shown as cards:
   - Date and time clearly displayed
   - Click any slot card to instantly book the appointment
   - Visual feedback on hover

3. **Streamlined Booking** - One-click booking directly from slot cards
   - No forms or dialogs to fill
   - Instant appointment confirmation

4. **Additional Options** - Tabs below allow patients to:
   - View scheduled appointments
   - Search for other doctors
   - Access medical records
   - View past appointments
