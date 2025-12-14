import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ScreenService } from '../../../services/screen.service';
import { Screen } from '../../../models/screen.type';
import { Customer } from '../../../models/customer.type';
import { Subject, takeUntil, interval } from 'rxjs';

@Component({
  selector: 'afoone-screens',
  templateUrl: './screen-view.component.html',
  styleUrls: ['./screen-view.component.css'],
  imports: [ProgressSpinnerModule, CommonModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ScreenViewComponent implements OnInit, OnDestroy {
  screen?: Screen;
  loading = true;
  customers: Customer[] = [];
  currentTime = new Date();
  private previousCustomerIds = new Set<string>();
  private previousCustomerStatuses = new Map<string, string>(); // Rastrear estados previos de clientes
  private previousRecallCounts = new Map<string, number>(); // Rastrear recallCount previo para detectar rellamadas
  blinkingCustomers = new Set<string>(); // IDs de clientes que están parpadeando

  private destroy$ = new Subject<void>();
  private readonly POLLING_INTERVAL = 5000; // 5 segundos
  private readonly BLINKING_DURATION = 10000; // 10 segundos
  private bellAudio?: HTMLAudioElement;
  private audioContext?: AudioContext;

  constructor(
    private screensService: ScreenService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Inicializar el contexto de audio
    this.initAudioContext();

    // Inicializar el sonido de campana
    this.initBellSound();

    // Actualizar hora cada segundo
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentTime = new Date();
      });

    // Obtener ID de la pantalla desde la ruta
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const screenId = params.get('id');
      if (screenId) {
        this.getScreen(screenId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Cerrar el contexto de audio si existe
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(err => {
        console.warn('Error cerrando contexto de audio:', err);
      });
    }
  }

  getScreen(id: string): void {
    this.loading = true;
    this.screensService
      .getScreenById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.screen = data;
          this.loading = false;
          this.initCustomerPolling();
        },
        error: (err) => {
          console.error('Error fetching screen', err);
          this.loading = false;
        },
      });
  }

  initCustomerPolling(): void {
    // Cargar inmediatamente
    this.getCustomers();

    // Configurar polling cada 5 segundos
    interval(this.POLLING_INTERVAL)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getCustomers();
      });
  }

  getCustomers(): void {
    if (!this.screen?._id) return;

    this.screensService
      .getScreenCustomers(this.screen._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const newCustomers = data || [];
          this.detectNewCustomers(newCustomers);
          // Ordenar: el último llamado (más reciente) primero
          const sortedCustomers = [...newCustomers].sort((a, b) => {
            // Si tienen queuedTime, ordenar por el más reciente primero
            if (a.queuedTime && b.queuedTime) {
              return b.queuedTime - a.queuedTime;
            }
            // Si no, mantener el orden original (el último en la lista es el más reciente)
            return 0;
          });
          this.customers = sortedCustomers;
        },
        error: (err) => {
          console.error('Error fetching customers for screen', err);
        },
      });
  }

  private detectNewCustomers(newCustomers: Customer[]): void {
    // Solo detectar nuevos clientes si ya tenemos una lista previa
    if (this.previousCustomerIds.size === 0) {
      // Primera carga, guardar todos los IDs, estados y recallCounts
      newCustomers.forEach(customer => {
        if (customer._id) {
          this.previousCustomerIds.add(customer._id);
          this.previousCustomerStatuses.set(customer._id, customer.status || '');
          this.previousRecallCounts.set(customer._id, customer.recallCount || 0);
        }
      });
      return;
    }

    // Detectar nuevos clientes, clientes que vuelven a CALLING, o clientes rellamados
    const newCustomerIds: string[] = [];

    newCustomers.forEach(customer => {
      if (!customer._id) return;

      const previousStatus = this.previousCustomerStatuses.get(customer._id);
      const currentStatus = customer.status || '';
      const previousRecallCount = this.previousRecallCounts.get(customer._id) || 0;
      const currentRecallCount = customer.recallCount || 0;

      // Detectar si es un cliente nuevo
      if (!this.previousCustomerIds.has(customer._id)) {
        newCustomerIds.push(customer._id);
      }
      // Detectar si un cliente que ya estaba vuelve a estado CALLING
      else if (previousStatus && previousStatus !== 'CALLING' && currentStatus === 'CALLING') {
        newCustomerIds.push(customer._id);
      }
      // Detectar si un cliente fue rellamado (recallCount aumentó)
      // Esto funciona incluso si ya estaba en estado CALLING
      else if (currentRecallCount > previousRecallCount) {
        newCustomerIds.push(customer._id);
      }
    });

    // Si hay nuevos clientes o clientes rellamados, hacerlos parpadear y sonar la campana
    if (newCustomerIds.length > 0) {
      this.playBellSound();
      this.startBlinking(newCustomerIds);
    }

    // Actualizar el set de IDs previos, estados y recallCounts
    this.previousCustomerIds.clear();
    this.previousCustomerStatuses.clear();
    this.previousRecallCounts.clear();
    newCustomers.forEach(customer => {
      if (customer._id) {
        this.previousCustomerIds.add(customer._id);
        this.previousCustomerStatuses.set(customer._id, customer.status || '');
        this.previousRecallCounts.set(customer._id, customer.recallCount || 0);
      }
    });
  }

  private startBlinking(customerIds: string[]): void {
    // Agregar los nuevos clientes al set de parpadeo
    customerIds.forEach(id => {
      this.blinkingCustomers.add(id);
    });

    // Remover el parpadeo después de 10 segundos
    setTimeout(() => {
      customerIds.forEach(id => {
        this.blinkingCustomers.delete(id);
      });
    }, this.BLINKING_DURATION);
  }

  isBlinking(customerId?: string): boolean {
    if (!customerId) return false;
    return this.blinkingCustomers.has(customerId);
  }

  private initBellSound(): void {
    // Crear un sonido de campana usando Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 0.6;
      const sampleRate = audioContext.sampleRate;
      const numSamples = Math.floor(duration * sampleRate);

      // Generar un sonido tipo campana con múltiples frecuencias
      const generateBellSound = (): AudioBuffer => {
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);
        const frequencies = [523.25, 659.25, 783.99]; // Do, Mi, Sol (acorde mayor)

        for (let i = 0; i < numSamples; i++) {
          const t = i / sampleRate;
          let sample = 0;

          frequencies.forEach((freq, index) => {
            const amplitude = Math.exp(-t * 3) * (1 - index * 0.2);
            sample += Math.sin(2 * Math.PI * freq * t) * amplitude;
          });

          // Aplicar envolvente ADSR
          const envelope = Math.exp(-t * 4);
          data[i] = sample * envelope * 0.3;
        }

        return buffer;
      };

      // Usar OfflineAudioContext para generar el audio
      const offlineContext = new OfflineAudioContext(1, numSamples, sampleRate);
      const source = offlineContext.createBufferSource();
      source.buffer = generateBellSound();
      source.connect(offlineContext.destination);
      source.start();

      offlineContext.startRendering().then(renderedBuffer => {
        const wav = this.bufferToWav(renderedBuffer);
        const blob = new Blob([wav], { type: 'audio/wav' });
        this.bellAudio = new Audio(URL.createObjectURL(blob));
        this.bellAudio.volume = 0.7; // Ajustar volumen
      }).catch(error => {
        console.warn('Error generando sonido de campana:', error);
        this.createSimpleBellSound();
      });
    } catch (error) {
      console.warn('No se pudo inicializar Web Audio API:', error);
      this.createSimpleBellSound();
    }
  }

  private createSimpleBellSound(): void {
    // Fallback: crear un sonido simple usando osciladores
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Guardar el contexto para poder reproducirlo después
      this.bellAudio = new Audio();
      // Para el fallback, usaremos el contexto directamente en playBellSound
      (this.bellAudio as any).audioContext = audioContext;
      (this.bellAudio as any).oscillator = oscillator;
      (this.bellAudio as any).gainNode = gainNode;
    } catch (error) {
      console.warn('No se pudo crear sonido de campana:', error);
    }
  }

  private bufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];

    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  }

  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Intentar activar el contexto de audio (requerido por políticas de autoplay)
      if (this.audioContext.state === 'suspended') {
        // Los navegadores requieren interacción del usuario para activar audio
        // Intentamos activarlo, pero puede fallar hasta que haya interacción
        this.audioContext.resume().catch(err => {
          console.warn('No se pudo activar el contexto de audio automáticamente:', err);
        });
      }
    } catch (error) {
      console.warn('No se pudo crear el contexto de audio:', error);
    }
  }

  private playBellSound(): void {
    // Método simplificado: usar Web Audio API con contexto reutilizable
    try {
      // Si no hay contexto, intentar crearlo
      if (!this.audioContext) {
        this.initAudioContext();
      }

      if (!this.audioContext) {
        console.warn('No hay contexto de audio disponible');
        return;
      }

      // Asegurarse de que el contexto esté activo
      const resumePromise = this.audioContext.state === 'suspended'
        ? this.audioContext.resume()
        : Promise.resolve();

      resumePromise.then(() => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext!.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext!.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.6);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.start();
        oscillator.stop(this.audioContext!.currentTime + 0.6);
      }).catch(error => {
        console.warn('Error activando contexto de audio:', error);

        // Fallback: intentar con el audio pre-generado si existe
        if (this.bellAudio?.src) {
          this.bellAudio.currentTime = 0;
          this.bellAudio.play().catch(err => {
            console.warn('No se pudo reproducir el audio de campana:', err);
          });
        }
      });
    } catch (error) {
      console.warn('Error reproduciendo sonido de campana:', error);

      // Fallback: intentar con el audio pre-generado si existe
      if (this.bellAudio?.src) {
        this.bellAudio.currentTime = 0;
        this.bellAudio.play().catch(err => {
          console.warn('No se pudo reproducir el audio de campana:', err);
        });
      }
    }
  }

  getFormattedTime(): string {
    return this.currentTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  getFormattedDate(): string {
    return this.currentTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  trackByCustomerId(index: number, customer: Customer): string | undefined {
    return customer._id;
  }

  hasLocationInfo(): boolean {
    return this.customers.some(customer => customer.operator?.pathDescription);
  }
}
