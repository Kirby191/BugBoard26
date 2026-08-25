package com.bugboard26.core.attachment.provider;

import com.bugboard26.core.attachment.exception.StorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * Implementazione Cloud dello Strategy Pattern per l'archiviazione su Amazon S3.
 * Rende il sistema Cloud-Ready senza modificare la logica di business.
 * Questo Bean viene attivato da Spring solo se nel file application.properties
 * è presente la riga: app.storage.provider=aws
 */
@Component
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "aws")
public class AwsS3StorageProviderImpl implements StorageProvider {

    // Attributo definito esplicitamente nel Class Diagram
    @Value("${aws.s3.bucket-name:bugboard26-bucket}")
    private String s3BucketName;

    @Override
    public String store(MultipartFile file, String uniqueFileName) {
        // Qui verrebbe integrato l'AmazonS3Client.
        // Simuliamo l'assenza del client con un'eccezione descrittiva.
        throw new StorageException(
                "L'implementazione AWS S3 è strutturalmente predisposta tramite Strategy Pattern, " +
                        "ma il bucket '" + s3BucketName + "' richiede il setup dell'SDK AWS in ambiente di produzione."
        );
    }

    @Override
    public Resource retrieve(String fileUrl) {
        throw new StorageException("Integrazione S3 non configurata per la lettura della risorsa: " + fileUrl);
    }
}
