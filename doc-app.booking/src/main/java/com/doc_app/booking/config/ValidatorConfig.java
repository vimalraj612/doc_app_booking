package com.doc_app.booking.config;

import com.doc_app.booking.validation.LocalizedMessageInterpolator;
import jakarta.validation.Validator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

/**
 * Configuration for custom validator with localized messages
 */
@Configuration
public class ValidatorConfig {

    @Autowired
    private LocalizedMessageInterpolator messageInterpolator;

    @Bean
    public Validator validator() {
        LocalValidatorFactoryBean factoryBean = new LocalValidatorFactoryBean();
        factoryBean.setMessageInterpolator(messageInterpolator);
        return factoryBean;
    }
}
