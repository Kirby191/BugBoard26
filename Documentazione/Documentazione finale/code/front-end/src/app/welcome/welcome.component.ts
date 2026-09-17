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
        <p><strong>Il Problema:</strong> I team di sviluppo software necessitano di tracciare le anomalie in modo strutturato, ma spesso gli strumenti esistenti sono eccessivamente dispersivi o complessi da configurare.</p>
        <p><strong>Il Processo:</strong> Sono partito dall'analisi dei requisiti (Use Cases), isolando i flussi vitali: segnalazione, assegnazione, tracciamento e risoluzione. L'obiettivo era azzerare il disordine cognitivo.</p>
        <p><strong>Il Risultato:</strong> <em>BugBoard26</em>. Una Single Page Application (SPA) fulminea e reattiva, progettata per offrire esclusivamente ciò che serve, quando serve, garantendo un'esperienza utente priva di latenze percettibili.</p>
      `
    },
    {
      title: 'Scelte Architetturali: Il mio Reasoning',
      icon: '🧠',
      contentHtml: `
        <p>Il sistema si basa su una rigorosa divisione architetturale. Per il Back-End ho evitato il classico approccio monolitico, abbracciando il pattern <strong>CQRS (Command Query Responsibility Segregation)</strong>.</p>
        <ul>
          <li><strong>Scrittura (Issue Management):</strong> Un sottosistema transazionale, isolato e rigoroso, che si assicura che ogni regola di business venga rispettata prima di toccare il database.</li>
          <li><strong>Lettura (Query & View):</strong> Un sottosistema ottimizzato per le estrazioni veloci, che eroga viste leggere per le Dashboard.</li>
        </ul>
        <p><strong>Perché questa scelta?</strong> Per massimizzare le performance. Nel Front-End (Angular), questi due mondi collidono armoniosamente: l'utente percepisce un'unica entità coesa, ignaro della complessa orchestrazione che avviene nei container Docker sottostanti.</p>
      `
    },
    {
      title: 'Ostacoli, Errori e Trade-Offs',
      icon: '⚖️',
      contentHtml: `
        <p>Costruire BugBoard26 ha richiesto decisioni difficili e ripensamenti costruttivi:</p>
        <ul>
          <li><strong>L'Overengineering iniziale:</strong> Inizialmente avevo progettato tabelle ponte "Molti-a-Molti" per le assegnazioni dei bug e notifiche fluttuanti come entità a sé stanti. Mi sono reso conto che questo appesantiva inutilmente le JOIN SQL. Ho rifattorizzato tutto verso eleganti relazioni "1 a Molti", vincolando fortemente le notifiche al ciclo di vita della Issue.</li>
          <li><strong>Il Trade-off sulle chiavi primarie:</strong> Ho scartato l'uso di <code>UUID</code> in favore di <code>BIGSERIAL</code>. Sebbene gli UUID offrano sicurezza distribuita, in questo contesto avrebbero frammentato gli indici B-Tree di PostgreSQL raddoppiando l'impiego di RAM.</li>
        </ul>
      `
    },
    {
      title: 'Limiti di Contesto e Sviluppi Futuri',
      icon: '🚀',
      contentHtml: `
        <p>Questo applicativo è stato sviluppato aderendo ai rigidi vincoli della <em>Modalità in itinere</em> accademica, che impone un perimetro di funzionalità ben definito. Questo ha guidato alcune scelte mirate:</p>
        <ul>
          <li><strong>Nessun server SMTP esterno:</strong> Le notifiche sono gestite tramite logica <em>Event-Driven</em> in-app per mantenere il sistema eseguibile in totale isolamento (offline).</li>
          <li><strong>Storage Locale vs Cloud:</strong> Il codice adotta lo <em>Strategy Pattern</em> ed è già predisposto per AWS S3, ma sfrutta un Docker Volume locale per azzerare i costi di hosting in fase di test.</li>
          <li><strong>RBAC Globale:</strong> La gestione granulare dei ruoli (es. Guest, Project Manager) è stata demandata al futuro, mantenendo l'attuale, solida distinzione tra Amministratore e Utente Base.</li>
        </ul>
      `
    }
  ];

  toggleSection(index: number): void {
    // Cliccare la sezione attiva la richiude; una nuova sezione sostituisce la precedente.
    this.openSectionIndex.update(current => current === index ? null : index);
  }
}
