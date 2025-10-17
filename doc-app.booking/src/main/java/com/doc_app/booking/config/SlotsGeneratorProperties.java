package com.doc_app.booking.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "slots.generator")
public class SlotsGeneratorProperties {
    /**
     * How many days ahead to generate slots for each doctor. Default 7.
     */
    private int daysAhead = 7;

    /**
     * Cron expression for daily generation. Default: every day at 02:00 AM.
     */
    private String cron = "0 0 2 * * *";

    public int getDaysAhead() {
        return daysAhead;
    }

    public void setDaysAhead(int daysAhead) {
        this.daysAhead = daysAhead;
    }

    public String getCron() {
        return cron;
    }

    public void setCron(String cron) {
        this.cron = cron;
    }
}
