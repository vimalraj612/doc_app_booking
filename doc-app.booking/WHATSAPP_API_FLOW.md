# WhatsApp Booking API Flow Example

## Complete Booking Flow with Patient ID as Sender Number

### Step 1: Initialize Booking
```
POST /api/v1/whatsapp/booking/init
```
**Parameters:**
- `phoneNumber`: Patient's WhatsApp number

**Response:** Sends initial booking instructions via WhatsApp

---

### Step 2: Search Doctors
```
POST /api/v1/whatsapp/booking/search-doctors
```
**Parameters:**
- `phoneNumber`: Patient's WhatsApp number
- `query`: Search term (doctor name, specialization, hospital name, or mobile number)

**Response:** Sends list of matching doctors via WhatsApp

**Example WhatsApp Message:**
```
🔍 Search Results 🔍

1. 👨‍⚕️ Dr. John Smith
   🩺 Cardiology
   📱 Reply '1' to select

2. 👨‍⚕️ Dr. Sarah Johnson
   🩺 Neurology
   📱 Reply '2' to select

Please reply with the doctor number to proceed with booking.
```

---

### Step 3: Show Available Dates
```
POST /api/v1/whatsapp/booking/available-dates
```
**Parameters:**
- `phoneNumber`: Patient's WhatsApp number
- `doctorId`: Selected doctor's ID

**Response:** Sends available dates via WhatsApp

**Example WhatsApp Message:**
```
📅 Available Dates for Dr. John Smith 📅

1. 📅 18/10/2025 (FRIDAY)
2. 📅 19/10/2025 (SATURDAY)
3. 📅 21/10/2025 (MONDAY)
4. 📅 22/10/2025 (TUESDAY)
5. 📅 23/10/2025 (WEDNESDAY)
6. 📅 24/10/2025 (THURSDAY)
7. 📅 25/10/2025 (FRIDAY)

Please reply with the date number (1-7) to see available slots.
```

---

### Step 4: Show Available Slots
```
POST /api/v1/whatsapp/booking/available-slots
```
**Parameters:**
- `phoneNumber`: Patient's WhatsApp number
- `doctorId`: Selected doctor's ID
- `dateNumber`: Selected date number (1-7)

**Response:** Sends available time slots via WhatsApp

**Example WhatsApp Message:**
```
⏰ Available Slots for 18/10/2025 ⏰

👨‍⚕️ Dr. John Smith

1. ⏰ 09:00 AM
2. ⏰ 10:30 AM
3. ⏰ 02:00 PM
4. ⏰ 03:30 PM
5. ⏰ 04:00 PM

Please reply with the slot number to book your appointment.
```

---

### Step 5: Confirm Booking
```
POST /api/v1/whatsapp/booking/confirm
```
**Parameters:**
- `phoneNumber`: Patient's WhatsApp number
- `doctorId`: Selected doctor's ID
- `dateNumber`: Selected date number (1-7)
- `slotNumber`: Selected slot number
- `patientId`: Patient ID (used as sender number)

**Response:** Books appointment and sends confirmation via WhatsApp

**Example WhatsApp Message:**
```
🎉 Appointment Confirmed! 🎉

📋 Appointment Details:
🆔 ID: 12345
👨‍⚕️ Doctor: Dr. John Smith
📅 Date: 18/10/2025
⏰ Time: 09:00 AM
🏥 Hospital: City General Hospital
👤 Patient ID: 678

Please arrive 15 minutes early.
Thank you! 🙏
```

---

## Complete API Workflow Example

### 1. Patient searches for a doctor:
```bash
curl -X POST "http://localhost:8080/api/v1/whatsapp/booking/search-doctors" \
  -d "phoneNumber=+1234567890&query=cardiology"
```

### 2. Patient selects doctor (doctorId = 123):
```bash
curl -X POST "http://localhost:8080/api/v1/whatsapp/booking/available-dates" \
  -d "phoneNumber=+1234567890&doctorId=123"
```

### 3. Patient selects date (dateNumber = 1 for tomorrow):
```bash
curl -X POST "http://localhost:8080/api/v1/whatsapp/booking/available-slots" \
  -d "phoneNumber=+1234567890&doctorId=123&dateNumber=1"
```

### 4. Patient books appointment (patientId = 678, slotNumber = 1):
```bash
curl -X POST "http://localhost:8080/api/v1/whatsapp/booking/confirm" \
  -d "phoneNumber=+1234567890&doctorId=123&dateNumber=1&slotNumber=1&patientId=678"
```

---

## Key Features

✅ **Patient ID as Sender Number**: The `patientId` parameter is used to identify the patient booking the appointment

✅ **Step-by-Step Flow**: Users can select date first, then slots, then confirm booking

✅ **Interactive WhatsApp Messages**: Rich formatted messages with emojis and clear instructions

✅ **Error Handling**: Proper error messages for invalid selections

✅ **Existing API Integration**: Uses existing `/api/v1/common/search/doctors` for doctor search

✅ **Real-time Slot Availability**: Shows actual available slots from the slot service

✅ **Appointment Confirmation**: Creates actual appointment records and sends confirmation

---

## Integration Points

- **Search API**: `/api/v1/common/search/doctors` (existing)
- **Doctor Service**: `getDoctorById()` for doctor details
- **Slot Service**: `getAvailableSlots()` for time slots
- **Appointment Service**: `createAppointment()` for booking
- **WhatsApp Service**: For sending formatted messages

## Notes

- Date numbers 1-7 represent the next 7 days from today
- Slot numbers correspond to available time slots for the selected date
- Patient ID must be valid and exist in the system
- All WhatsApp messages are formatted with emojis and clear structure