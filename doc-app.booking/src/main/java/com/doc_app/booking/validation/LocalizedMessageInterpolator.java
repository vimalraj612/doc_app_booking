package com.doc_app.booking.validation;

import com.doc_app.booking.util.LocaleManager;
import jakarta.validation.MessageInterpolator;
import org.hibernate.validator.messageinterpolation.ResourceBundleMessageInterpolator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Custom message interpolator that uses LocaleManager for validation messages.
 */
@Component
public class LocalizedMessageInterpolator implements MessageInterpolator {

    private final MessageInterpolator defaultInterpolator;
    private final LocaleManager localeManager;

    @Autowired
    public LocalizedMessageInterpolator(LocaleManager localeManager) {
        this.defaultInterpolator = new ResourceBundleMessageInterpolator();
        this.localeManager = localeManager;
    }

    @Override
    public String interpolate(String messageTemplate, Context context) {
        return interpolate(messageTemplate, context, null);
    }

    @Override
    public String interpolate(String messageTemplate, Context context, Locale locale) {
        // Remove curly braces if present (from {validation.key})
        String key = messageTemplate;
        if (key.startsWith("{") && key.endsWith("}")) {
            key = key.substring(1, key.length() - 1);
        }

        // Try to get message from LocaleManager
        String message = localeManager.getMessage(key);
        
        // If message is the same as key, it wasn't found - try default interpolator
        if (message.equals(key)) {
            return defaultInterpolator.interpolate(messageTemplate, context, locale);
        }

        return message;
    }
}
