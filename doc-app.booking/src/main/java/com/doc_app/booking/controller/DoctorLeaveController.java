package com.doc_app.booking.controller;

import com.doc_app.booking.dto.request.DoctorLeaveRequest;
import com.doc_app.booking.dto.response.DoctorLeaveResponse;
import com.doc_app.booking.model.DoctorLeave;
import com.doc_app.booking.service.DoctorLeaveService;
import com.doc_app.booking.service.scheduler.DailySlotGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/doctor-leaves")
public class DoctorLeaveController {

    private final DoctorLeaveService leaveService;
    private final DailySlotGenerator generator;

    @PostMapping
    public ResponseEntity<DoctorLeaveResponse> create(
            @org.springframework.web.bind.annotation.RequestBody @jakarta.validation.Valid DoctorLeaveRequest req) {
        DoctorLeave created = leaveService.createLeave(req.getDoctorId(), req.getDate(), req.getReason());
        DoctorLeaveResponse resp = new DoctorLeaveResponse(created.getId(), created.getDoctor().getId(),
                created.getDate(), created.getReason());
        return ResponseEntity.created(URI.create("/api/v1/doctor-leaves/" + created.getId())).body(resp);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorLeaveResponse>> listForDoctor(@PathVariable Long doctorId) {
        var leaves = leaveService.getLeavesForDoctor(doctorId);
        var resp = leaves.stream()
                .map(l -> new DoctorLeaveResponse(l.getId(), l.getDoctor().getId(), l.getDate(), l.getReason()))
                .toList();
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        leaveService.deleteLeave(id);
        return ResponseEntity.noContent().build();
    }

    // Manual trigger: run the daily generator on demand (useful for
    // testing/backfill)
    @PostMapping("/generate-now")
    public ResponseEntity<String> triggerGenerationNow() {
        generator.generateDailyAsync();
        return ResponseEntity.ok("Generator triggered");
    }
}
