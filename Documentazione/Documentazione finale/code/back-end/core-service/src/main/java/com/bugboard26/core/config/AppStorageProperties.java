package com.bugboard26.core.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties("app.storage")
public class AppStorageProperties {

    private String uploadDir = "./core_uploads";
}
