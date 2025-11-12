package com.doc_app.booking.config;

import com.doc_app.booking.util.LocaleManager;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor to set locale based on request header
 */
@Component
public class LocaleInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, 
                           @NonNull HttpServletResponse response, 
                           @NonNull Object handler) {
        // Get locale from header (default to 'en' if not present)
        String locale = request.getHeader("Accept-Language");
        
        if (locale == null || locale.isEmpty()) {
            locale = "en";
        } else {
            // Handle various formats: "ta", "ta-IN", "ta_IN"
            locale = locale.toLowerCase().split("[_-]")[0];
        }
        
        // Only support 'en' and 'ta'
        if (!"ta".equals(locale)) {
            locale = "en";
        }
        
        LocaleManager.setLocale(locale);
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, 
                               @NonNull HttpServletResponse response, 
                               @NonNull Object handler, 
                               Exception ex) {
        // Clear locale to prevent memory leaks
        LocaleManager.clearLocale();
    }
}
