package com.doc_app.booking.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers("/", "/index", "/welcome").permitAll() // Allow root access
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll() // Swagger access
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/whatsapp/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/patients/signup/**").permitAll() // Patient signup endpoints
                .requestMatchers(HttpMethod.POST, "/api/v1/hospitals/signup/**").permitAll() // Hospital signup endpoints
                .requestMatchers(HttpMethod.POST, "/api/v1/doctors/signup/**").permitAll() // Doctor signup endpoints
                .requestMatchers("/health", "/actuator/**").permitAll()
                
                // Hospital Admin only endpoints
                .requestMatchers("/api/v1/hospitals/**").hasRole("HOSPITAL_ADMIN")
                .requestMatchers("/api/v1/doctors/*/hospital/**").hasRole("HOSPITAL_ADMIN")
                
                // Doctor endpoints
                .requestMatchers("/api/v1/doctors/profile/**").hasRole("DOCTOR")
                .requestMatchers("/api/v1/doctor-leaves/**").hasAnyRole("DOCTOR", "HOSPITAL_ADMIN")
                .requestMatchers("/api/v1/slots/doctor/**").hasAnyRole("DOCTOR", "HOSPITAL_ADMIN")
                
                // Patient endpoints
                .requestMatchers("/api/v1/patients/profile/**").hasRole("PATIENT")
                .requestMatchers("/api/v1/appointments/patient/**").hasRole("PATIENT")
                
                // Common endpoints (authenticated users)
                .requestMatchers("/api/v1/appointments/**").hasAnyRole("PATIENT", "DOCTOR", "HOSPITAL_ADMIN")
                .requestMatchers("/api/v1/slots/**").hasAnyRole("PATIENT", "DOCTOR", "HOSPITAL_ADMIN")
                .requestMatchers("/api/v1/common/**").hasAnyRole("PATIENT", "DOCTOR", "HOSPITAL_ADMIN")
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}