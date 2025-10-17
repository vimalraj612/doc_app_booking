# WhatsApp Integration Setup Guide

## Overview
This guide explains how to set up WhatsApp Business API integration for appointment booking system.

## Prerequisites
1. WhatsApp Business Account
2. Facebook Developer Account
3. WhatsApp Business API Access

## Setup Steps

### 1. Facebook Developer Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add WhatsApp product to your app
4. Get your access token and phone number ID

### 2. Configuration
Update the following properties in `application.properties`:
```properties
whatsapp.api.url=https://graph.facebook.com/v18.0
whatsapp.api.token=YOUR_ACCESS_TOKEN
whatsapp.phone.number.id=YOUR_PHONE_NUMBER_ID
whatsapp.verify.token=YOUR_VERIFY_TOKEN
```

### 3. Webhook Setup
1. Set up webhook URL: `https://your-domain.com/api/v1/whatsapp/webhook`
2. Use the verify token from your configuration
3. Subscribe to message events

## WhatsApp Booking Flow

### Step 1: Initialize Booking
**Endpoint:** `POST /api/v1/whatsapp/booking/init`
**Parameters:** `phoneNumber`

**Flow:**
1. Patient sends message or calls this API
2. System checks if patient exists by phone number
3. If patient exists:
   - Shows last visited doctor
   - Asks if they want to book with same doctor or search for different one
4. If patient doesn't exist:
   - Sends registration instructions

**Example Messages:**
```
👋 Hello John!

🏥 Last Visited Doctor: Dr. Smith

Would you like to book an appointment with Dr. Smith again?

Or if you need a different doctor, you can search by:
• 👨‍⚕️ Doctor name
• 🏥 Hospital name  
• 🩺 Specialization
• 📱 Doctor mobile number

Please reply with your choice or search criteria.
```

### Step 2: Doctor Search
**Endpoint:** `POST /api/v1/whatsapp/booking/search-doctors`
**Parameters:** `phoneNumber`, `query`

**Flow:**
1. Patient replies with search criteria
2. System searches doctors using `/api/v1/common/search/doctors`
3. Returns list of matching doctors

**Example Messages:**
```
🔍 Search Results 🔍

1. 👨‍⚕️ Dr. John Smith
   🩺 Cardiology
   🏥 City Hospital
   📱 +1234567890

2. 👨‍⚕️ Dr. Sarah Johnson
   🩺 Cardiology
   🏥 General Hospital
   📱 +1234567891

Please reply with the doctor number to see available dates.
```

### Step 3: Available Dates
**Endpoint:** `POST /api/v1/whatsapp/booking/available-dates`
**Parameters:** `phoneNumber`, `doctorId`

**Flow:**
1. Patient selects doctor by number
2. System shows next 7 days of available dates

**Example Messages:**
```
📅 Available Dates for Dr. Smith 📅

1. 📅 18/10/2025 (FRIDAY)
2. 📅 19/10/2025 (SATURDAY)
3. 📅 21/10/2025 (MONDAY)
4. 📅 22/10/2025 (TUESDAY)
5. 📅 23/10/2025 (WEDNESDAY)

Please select a date by replying with the date number.
```

### Step 4: Available Slots
**Endpoint:** `POST /api/v1/whatsapp/booking/available-slots`
**Parameters:** `phoneNumber`, `doctorId`, `selectedDate`

**Flow:**
1. Patient selects date
2. System shows available time slots for that date

**Example Messages:**
```
⏰ Available Time Slots for 18/10/2025 ⏰

1. ⏰ 09:00 AM
2. ⏰ 10:30 AM
3. ⏰ 02:00 PM
4. ⏰ 03:30 PM
5. ⏰ 04:00 PM

Please select a time slot by replying with the slot number.
```

### Step 5: Book Appointment
**Endpoint:** `POST /api/v1/whatsapp/booking/confirm`
**Parameters:** `phoneNumber`, `doctorId`, `slotId`

**Flow:**
1. Patient selects time slot
2. System books the appointment
3. Sends confirmation via WhatsApp

**Example Messages:**
```
🏥 Appointment Confirmed 🏥

Dear John Smith,

Your appointment has been successfully booked:

👨‍⚕️ Doctor: Dr. John Smith
🏥 Hospital: City Hospital
📅 Date & Time: 18/10/2025 09:00 AM
🆔 Appointment ID: 12345

Please arrive 15 minutes before your appointment time.

Thank you for choosing our service! 🙏
```

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/whatsapp/booking/init` | POST | Initialize booking flow |
| `/api/v1/whatsapp/booking/search-doctors` | POST | Search doctors |
| `/api/v1/whatsapp/booking/available-dates` | POST | Get available dates |
| `/api/v1/whatsapp/booking/available-slots` | POST | Get available slots |
| `/api/v1/whatsapp/booking/confirm` | POST | Book appointment |
| `/api/v1/whatsapp/webhook` | POST/GET | WhatsApp webhook |
| `/api/v1/common/search/doctors` | GET | Search doctors (existing API) |

## Features Removed
- ❌ Email notifications
- ❌ Email reminder system
- ❌ Email templates

## Features Added
- ✅ WhatsApp message sending
- ✅ WhatsApp appointment confirmations
- ✅ WhatsApp reminders
- ✅ Interactive booking flow
- ✅ Doctor search via WhatsApp
- ✅ Date and slot selection via WhatsApp

## Testing
1. Set up WhatsApp Business API test environment
2. Configure webhook URLs
3. Test the complete booking flow
4. Verify message delivery and formatting

## Notes
- Replace email service with WhatsApp service in all appointment operations
- Update notification scheduler to use WhatsApp
- Ensure phone numbers are in international format (+1234567890)
- Handle WhatsApp API rate limits and errors gracefully