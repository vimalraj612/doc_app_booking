# Direct Doctor WhatsApp Booking Flow

## Overview
Patients can save doctor's WhatsApp numbers in their mobile contacts and send "hi" directly to book appointments, skipping the search step.

## Setup Process

### Step 1: Save Doctor's WhatsApp Number
- Save doctor's mobile number in your phone contacts
- Use doctor's name as contact name (e.g., "Dr. John Smith - Cardiology")

### Step 2: Send "Hi" to Doctor
- Open WhatsApp and send "hi" to the doctor's number
- The system will automatically detect and respond

## API Flow for Direct Doctor Booking

### 1. Handle "Hi" Message to Doctor
```
POST /api/v1/whatsapp/doctor/hi-message
```
**Parameters:**
- `patientPhoneNumber`: Patient's WhatsApp number (who sent "hi")
- `doctorPhoneNumber`: Doctor's WhatsApp number (who received "hi")

**Response:** Sends welcome message with doctor info and available dates

**Example WhatsApp Response:**
```
👋 Hello! Welcome to Dr. John Smith's clinic!

👨‍⚕️ Doctor: Dr. John Smith
🩺 Specialization: Cardiology  
🏥 Hospital: City General Hospital

📅 Available Dates: 📅

1. 📅 18/10/2025 (FRIDAY)
2. 📅 19/10/2025 (SATURDAY)
3. 📅 21/10/2025 (MONDAY)
4. 📅 22/10/2025 (TUESDAY)
5. 📅 23/10/2025 (WEDNESDAY)
6. 📅 24/10/2025 (THURSDAY)
7. 📅 25/10/2025 (FRIDAY)

💬 Reply with date number (1-7) to see available slots!
📞 Or call us for immediate booking: +1234567890
```

### 2. Get Available Slots (Quick)
```
POST /api/v1/whatsapp/doctor/quick-slots
```
**Parameters:**
- `patientPhoneNumber`: Patient's WhatsApp number
- `doctorPhoneNumber`: Doctor's WhatsApp number
- `dateNumber`: Selected date (1-7)

**Response:** Sends available time slots

**Example WhatsApp Response:**
```
⏰ Available Slots - 18/10/2025 ⏰

👨‍⚕️ Dr. John Smith

1. ⏰ 09:00 AM - 09:30 AM
2. ⏰ 10:30 AM - 11:00 AM
3. ⏰ 02:00 PM - 02:30 PM
4. ⏰ 03:30 PM - 04:00 PM
5. ⏰ 04:00 PM - 04:30 PM

💬 Reply with slot number to book instantly!
📞 Or call for assistance: +1234567890
```

### 3. Quick Book Appointment
```
POST /api/v1/whatsapp/doctor/quick-book
```
**Parameters:**
- `patientPhoneNumber`: Patient's WhatsApp number
- `doctorPhoneNumber`: Doctor's WhatsApp number  
- `dateNumber`: Selected date (1-7)
- `slotNumber`: Selected slot number
- `patientId`: Patient ID for booking

**Response:** Books appointment and sends confirmation

**Example WhatsApp Response:**
```
✅ Appointment Confirmed! ✅

🎉 Your appointment is booked successfully!

📋 Details:
🆔 Appointment ID: 12345
👨‍⚕️ Doctor: Dr. John Smith
🩺 Specialization: Cardiology
📅 Date: 18/10/2025
⏰ Time: 09:00 AM - 09:30 AM
🏥 Hospital: City General Hospital
👤 Patient ID: 678

📝 Important Notes:
• Please arrive 15 minutes early
• Bring valid ID and previous reports
• Contact us for any changes: +1234567890

Thank you for choosing our service! 🙏
```

## Complete User Journey Example

### 1. Patient saves doctor's number and sends "hi"
```bash
# System receives "hi" message
curl -X POST "http://localhost:8080/api/v1/whatsapp/doctor/hi-message" \
  -d "patientPhoneNumber=+1987654321&doctorPhoneNumber=+1234567890"
```

### 2. Patient replies "2" (selects second date)
```bash
curl -X POST "http://localhost:8080/api/v1/whatsapp/doctor/quick-slots" \
  -d "patientPhoneNumber=+1987654321&doctorPhoneNumber=+1234567890&dateNumber=2"
```

### 3. Patient replies "3" (selects third slot) with patient ID
```bash
curl -X POST "http://localhost:8080/api/v1/whatsapp/doctor/quick-book" \
  -d "patientPhoneNumber=+1987654321&doctorPhoneNumber=+1234567890&dateNumber=2&slotNumber=3&patientId=678"
```

## Benefits of Direct Doctor Booking

✅ **Skip Search Step**: No need to search for doctors  
✅ **Personal Touch**: Direct contact with doctor's WhatsApp  
✅ **Quick Booking**: 3-step process (hi → date → slot)  
✅ **Familiar Contact**: Use saved contacts like calling a friend  
✅ **Instant Response**: Immediate availability and booking  
✅ **Doctor Branding**: Each doctor has their own WhatsApp presence  

## Implementation Notes

- **Doctor Phone Number Lookup**: Uses existing search API to find doctor by mobile number
- **Unique Mobile Numbers**: Assumes each doctor has a unique mobile number
- **Patient ID Required**: Still needs patient ID for final booking
- **Error Handling**: Graceful fallback to phone call option
- **Personal Experience**: Feels like chatting directly with doctor's clinic

## WhatsApp Business Account Setup

Each doctor should have:
1. **WhatsApp Business Account** with their mobile number
2. **Business Profile** with clinic name and details
3. **Auto-reply messages** for after-hours
4. **Webhook integration** pointing to your booking system

This creates a personalized booking experience where patients feel they're directly communicating with their doctor's clinic! 🏥💬