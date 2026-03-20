import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

export interface Mensaje {
  usuario: any;
  organizacion: string; 
  contenido: string;
  _id?: string;
  leido?: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Chat {
  private socket: Socket | null = null;
  private readonly SERVER_URL = 'http://localhost:1337';

  constructor(private http: HttpClient) {}

  connect(username: string): void {
    if (!username) {
      return;
    }

    if (this.socket?.connected) {
      this.socket.disconnect();
    }
    this.socket = io(this.SERVER_URL, {
      query: {
        username,
      },
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket conectado:', this.socket?.id);
    });
  }

  getHistory(): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.SERVER_URL}/mensajes`);
  }

  joinOrganization(organizacionId: string): void {
    this.socket?.emit('join-organization', organizacionId);
  }

  sendMessage(mensaje: Mensaje): void {
    this.socket?.emit('message', mensaje);
  }

  sendTyping(usuario: string, usuarioName: string): void {
    this.socket?.emit('typing', { usuario: usuario, usuarioName: usuarioName });
  }

  stopTyping(usuario: string, usuarioName: string): void {
    this.socket?.emit('stop-typing', { usuario: usuario, usuarioName: usuarioName });
  }

  onActiveUsers(): Observable<string[]> {
    return new Observable((observer) => {
      if (!this.socket) {
        observer.complete();
        return;
      }

      const handler = (payload: { data?: string[] }) => {
        observer.next(payload.data ?? []);
      };

      this.socket.on('active-users', handler);

      return () => {
        this.socket?.off('active-users', handler);
      };
    });
  }

  onUserTyping(): Observable<any> {
    return new Observable((observer) => {
      if (!this.socket) {
        observer.complete();
        return;
      }

      const handler = (data: unknown) => {
        observer.next(data);
      };

      this.socket.on('user-typing', handler);

      return () => {
        this.socket?.off('user-typing', handler);
      };
    });
  }

  onUserStopTyping(): Observable<any> {
    return new Observable((observer) => {
      if (!this.socket) {
        observer.complete();
        return;
      }

      const handler = (data: unknown) => {
        observer.next(data);
      };

      this.socket.on('user-stop-typing', handler);

      return () => {
        this.socket?.off('user-stop-typing', handler);
      };
    });
  }

  getMessages(): Observable<Mensaje> {
    return new Observable((observer) => {
      if (!this.socket) {
        observer.complete();
        return;
      }

      const handler = (data: Mensaje) => {
        observer.next(data);
      };

      this.socket.on('message', handler);

      return () => {
        this.socket?.off('message', handler);
      };
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
