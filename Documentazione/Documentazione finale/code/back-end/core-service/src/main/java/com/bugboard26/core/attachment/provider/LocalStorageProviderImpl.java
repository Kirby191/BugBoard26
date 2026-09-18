package com.bugboard26.core.attachment.provider;

import com.bugboard26.core.attachment.exception.FileNotFoundException;
import com.bugboard26.core.attachment.exception.StorageException;
import com.bugboard26.core.attachment.exception.UnauthorizedFileAccessException;
import com.bugboard26.core.config.AppStorageProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

/**
 * Implementazione concreta dello Strategy Pattern per lo storage locale.
 * Salva i file sul file system (mappato come Docker Volume) per evitare
 * il salvataggio di BLOB nel database e servizi cloud a pagamento.
 */
@Component
public class LocalStorageProviderImpl implements StorageProvider {

    private final Path rootLocation;
    private static final String URI_PREFIX = "/api/attachments/";

    public LocalStorageProviderImpl(AppStorageProperties properties) {
        this.rootLocation = Path.of(properties.getUploadDir()).toAbsolutePath().normalize();
    }

    /**
     * Inizializza la directory di destinazione all'avvio del container Spring Boot.
     */
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new StorageException("Impossibile inizializzare la directory di storage degli allegati", e);
        }
    }

    @Override
    public String store(MultipartFile file, String uniqueFileName) {
        /*
         * Il nome è già stato normalizzato dal servizio, ma il controllo sul
         * path resta qui come ultima barriera contro il path traversal.
         */
        try {
            // Risoluzione sicura del path per evitare vulnerabilità di Path Traversal
            Path destinationFile = this.rootLocation.resolve(Path.of(uniqueFileName)).normalize().toAbsolutePath();

            if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
                throw new StorageException("Sicurezza: Impossibile salvare il file al di fuori della directory corrente.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return URI_PREFIX + uniqueFileName;

        } catch (IOException e) {
            throw new StorageException("Errore fisico nel salvataggio del file: " + uniqueFileName, e);
        }
    }

    @Override
    public Resource retrieve(String fileUrl) {
        // Anche in lettura il percorso viene confinato alla directory configurata.
        try {
            String filename = fileUrl.replace(URI_PREFIX, "");
            Path file = rootLocation.resolve(filename).normalize();

            // Anche gli URL pubblici devono restare confinati alla directory degli allegati.
            if (!file.startsWith(rootLocation)) {
                throw new UnauthorizedFileAccessException("Accesso al file non autorizzato");
            }

            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new FileNotFoundException("Impossibile leggere o trovare il file: " + filename);
            }

        } catch (MalformedURLException e) {
            throw new FileNotFoundException("URL del file non formattato correttamente: " + fileUrl);
        }
    }
}
