package com.doc_app.booking.service;

import com.doc_app.booking.dto.SlotTemplateDTO;
import com.doc_app.booking.dto.request.SlotTemplateRequestDTO;

import java.util.List;

public interface SlotTemplateService {
    SlotTemplateRequestDTO createOrUpdateSlotTemplate(SlotTemplateRequestDTO dto);

    List<SlotTemplateDTO> getSlotTemplateByDoctor(Long doctorId);
}
