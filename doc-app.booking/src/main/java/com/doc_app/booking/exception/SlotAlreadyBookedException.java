package com.doc_app.booking.exception;

public class SlotAlreadyBookedException extends RuntimeException {
    public SlotAlreadyBookedException() {
        super();
    }

    public SlotAlreadyBookedException(String message) {
        super(message);
    }
}
