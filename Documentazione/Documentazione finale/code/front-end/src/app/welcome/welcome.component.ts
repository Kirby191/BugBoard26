// ------------------------------------------------
// APP / WELCOME / WELCOME
// ------------------------------------------------

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

interface PresentationSection {
  title: string;
  icon: string;
  contentHtml: string;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  protected readonly authService = inject(AuthService);

  // L'indice singolo garantisce che l'interfaccia mostri una sola sezione aperta.
  protected readonly openSectionIndex = signal<number | null>(null);

  // Contenuti editoriali della pagina: il template si limita a renderizzarli.
  protected readonly sections: PresentationSection[] = [
    {
      title: 'Il Problema e la Soluzione',
      icon: '🎯',
      contentHtml: `
        <p><strong>Il punto di partenza:</strong> una segnalazione utile non dovrebbe fermarsi a un titolo e a uno stato. Deve conservare contesto, priorità, scadenza, responsabile e traccia delle decisioni prese.</p>
        <p><strong>La risposta:</strong> BugBoard26 è una piattaforma per organizzare progetti e issue in un unico flusso. Un utente può aprire una segnalazione, descriverla, allegare un file, assegnarla e seguirne l'avanzamento fino alla chiusura.</p>
        <p><strong>Il risultato:</strong> una SPA Angular pensata per rendere leggibile il lavoro quotidiano: dashboard per orientarsi, filtri per trovare rapidamente ciò che serve e una pagina di dettaglio che riunisce dati, allegati e storico.</p>
      `
    },
    {
      title: 'Scelte Architetturali: Il mio Reasoning',
      icon: '🧠',
      contentHtml: `
        <p>Il progetto separa responsabilità diverse senza nasconderle dietro un unico blocco. Il front-end Angular parla con due servizi Spring Boot: un <strong>Auth Service</strong> per login, registrazione e identità, e un <strong>Core Service</strong> per progetti, issue, allegati, storico e notifiche.</p>
        <ul>
          <li><strong>Autenticazione:</strong> sessioni stateless con JWT, password protette con BCrypt e autorizzazioni distinte per utente e amministratore.</li>
          <li><strong>Query & View:</strong> le letture della dashboard e dei dettagli sono raccolte in un percorso dedicato, con DTO più leggeri e filtri per progetto, stato, tipo, priorità e assegnatario.</li>
          <li><strong>Operatività:</strong> PostgreSQL, Docker Compose e una rete interna collegano database, servizi e Nginx in un ambiente riproducibile.</li>
        </ul>
        <p><strong>Perché questa scelta?</strong> Per tenere separati i confini che cambiano con velocità diverse, mantenendo però un'esperienza unica per chi usa l'applicazione.</p>
      `
    },
    {
      title: 'Ostacoli, Errori e Trade-Offs',
      icon: '⚖️',
      contentHtml: `
        <p>La parte più istruttiva è arrivata quando il comportamento atteso e quello visualizzato hanno smesso di coincidere. Le correzioni non sono state solo estetiche: hanno costretto a rivedere query, flussi e responsabilità.</p>
        <ul>
          <li><strong>Dati e interfaccia:</strong> la dashboard mostrava risultati incoerenti perché filtri e query non erano allineati. La soluzione è stata correggere il metodo repository e il passaggio dei parametri fino al componente Angular, includendo anche le scadenze imminenti e quelle superate.</li>
          <li><strong>Storico comprensibile:</strong> il log degli aggiornamenti è stato reso esplicito, così un cambio di stato o di assegnatario racconta cosa è successo, non solo quando.</li>
          <li><strong>Esperienza d'uso:</strong> modal, empty state e gestione delle immagini sono stati ripensati dopo aver incontrato casi reali: nessun contenuto, modifica di un allegato o necessità di mostrare messaggi coerenti in più schermate.</li>
        </ul>
      `
    },
    {
      title: 'Limiti di Contesto e Sviluppi Futuri',
      icon: '🚀',
      contentHtml: `
        <p>BugBoard26 nasce in un contesto accademico, quindi ogni scelta è stata valutata anche in base a tempo, riproducibilità e chiarezza della consegna. Il perimetro attuale è volutamente concreto, ma lascia spazio a evoluzioni naturali:</p>
        <ul>
          <li><strong>Notifiche in tempo reale:</strong> le assegnazioni e gli aggiornamenti possono arrivare durante la sessione tramite SSE, mentre le notifiche non lette restano persistenti e possono essere marcate come lette.</li>
          <li><strong>File senza perdita:</strong> gli allegati sono salvati nel volume Docker del Core Service, una scelta semplice per sviluppo e test che potrà essere sostituita da uno storage cloud in un ambiente di produzione.</li>
          <li><strong>Prossimi passi:</strong> ampliare la granularità dei ruoli, irrobustire la gestione dello storage e continuare a estrarre componenti e modelli comuni man mano che crescono i flussi.</li>
        </ul>
      `
    }
  ];

  toggleSection(index: number): void {
    // Cliccare la sezione attiva la richiude; una nuova sezione sostituisce la precedente.
    this.openSectionIndex.update(current => current === index ? null : index);
  }
}
