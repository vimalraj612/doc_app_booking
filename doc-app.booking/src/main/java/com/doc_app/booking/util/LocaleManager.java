package com.doc_app.booking.util;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Locale manager for handling English and Tamil messages.
 * Does not use Spring i18n - uses separate message files.
 */
@Component
public class LocaleManager {

    private static final String ENGLISH_MESSAGES = "messages_en.properties";
    private static final String TAMIL_MESSAGES = "messages_ta.properties";
    
    private final Map<String, Properties> messageCache = new HashMap<>();
    
    // Thread-local for storing current locale
    private static final ThreadLocal<String> currentLocale = ThreadLocal.withInitial(() -> "en");
    
    public LocaleManager() {
        // Load messages at startup
        loadMessages(ENGLISH_MESSAGES, "en");
        loadMessages(TAMIL_MESSAGES, "ta");
    }
    
    /**
     * Load messages from properties file
     */
    private void loadMessages(String fileName, String locale) {
        Properties properties = new Properties();
        try (InputStreamReader reader = new InputStreamReader(
                getClass().getClassLoader().getResourceAsStream(fileName),
                StandardCharsets.UTF_8)) {
            properties.load(reader);
            messageCache.put(locale, properties);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load messages file: " + fileName, e);
        }
    }
    
    /**
     * Set current locale for the thread
     * @param locale "en" for English, "ta" for Tamil
     */
    public static void setLocale(String locale) {
        if (!"en".equals(locale) && !"ta".equals(locale)) {
            throw new IllegalArgumentException("Unsupported locale: " + locale + ". Only 'en' and 'ta' are supported.");
        }
        currentLocale.set(locale);
    }
    
    /**
     * Get current locale
     * @return current locale ("en" or "ta")
     */
    public static String getLocale() {
        return currentLocale.get();
    }
    
    /**
     * Clear locale (resets to default "en")
     */
    public static void clearLocale() {
        currentLocale.remove();
    }
    
    /**
     * Get message by key for current locale
     * @param key message key
     * @return localized message
     */
    public String getMessage(String key) {
        String locale = currentLocale.get();
        Properties properties = messageCache.get(locale);
        
        if (properties == null) {
            // Fallback to English if locale not found
            properties = messageCache.get("en");
        }
        
        String message = properties.getProperty(key);
        if (message == null) {
            // Fallback to key if message not found
            return key;
        }
        
        return message;
    }
    
    /**
     * Get message by key with arguments
     * @param key message key
     * @param args arguments to replace {0}, {1}, etc.
     * @return formatted localized message
     */
    public String getMessage(String key, Object... args) {
        String message = getMessage(key);
        if (args != null && args.length > 0) {
            return MessageFormat.format(message, args);
        }
        return message;
    }
    
    /**
     * Get message for specific locale
     * @param key message key
     * @param locale locale ("en" or "ta")
     * @return localized message
     */
    public String getMessage(String key, String locale) {
        Properties properties = messageCache.get(locale);
        
        if (properties == null) {
            // Fallback to English if locale not found
            properties = messageCache.get("en");
        }
        
        String message = properties.getProperty(key);
        if (message == null) {
            // Fallback to key if message not found
            return key;
        }
        
        return message;
    }
    
    /**
     * Get message for specific locale with arguments
     * @param key message key
     * @param locale locale ("en" or "ta")
     * @param args arguments to replace {0}, {1}, etc.
     * @return formatted localized message
     */
    public String getMessage(String key, String locale, Object... args) {
        String message = getMessage(key, locale);
        if (args != null && args.length > 0) {
            return MessageFormat.format(message, args);
        }
        return message;
    }
}
